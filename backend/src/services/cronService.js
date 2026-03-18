const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

const processDailySubscriptions = async () => {
  console.log('Running daily subscription cron job...');
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const now = new Date();
    // Delivery target: if run before 4 AM, target today. Otherwise target tomorrow.
    const targetDate = new Date(now);
    if (now.getHours() >= 4) {
      targetDate.setDate(now.getDate() + 1);
    }
    targetDate.setHours(0, 0, 0, 0);
    
    console.log(`Target delivery date for this run: ${targetDate.toDateString()}`);
    
    // 1. Cancel subscriptions that have reached their end date
    await Subscription.updateMany(
      { 
        status: 'active', 
        cancelAtEnd: true, 
        endDate: { $lte: now } 
      },
      { 
        $set: { status: 'cancelled' } 
      },
      { session }
    );

    // 2. Generate daily orders for tomorrow
    // Find active subscriptions that haven't generated an order for tomorrow yet
    // and aren't paused beyond tomorrow
    
    // Simplification: just find all active subscriptions
    const activeSubs = await Subscription.find({ 
      status: 'active',
      startDate: { $lte: targetDate },
      $or: [
        { pausedUntil: null },
        { pausedUntil: { $lt: targetDate } }
      ]
    }).populate('product').session(session);

    for (const sub of activeSubs) {
      // Check if tomorrow is a skip date
      const isSkipDate = sub.skipDates.some(skip => {
        const d = new Date(skip);
        return d.toDateString() === targetDate.toDateString();
      });

      if (isSkipDate) continue;

      // Logic for alternate days
      if (sub.frequency === 'alternate') {
        const daysDiff = Math.floor((targetDate - new Date(sub.startDate)) / (1000 * 60 * 60 * 24));
        if (daysDiff % 2 !== 0) continue; // Skip alternate days
      }

      // Check if we already generated for tomorrow
      if (sub.lastOrderGeneratedAt && new Date(sub.lastOrderGeneratedAt).toDateString() === targetDate.toDateString()) {
        continue;
      }

      // We need to fetch the User to get their primary address for deliveryAddress
      const userDoc = await User.findById(sub.user).session(session);
      let primaryAddress = userDoc?.address || 'No Default Address';
      let coords = null;

      if (userDoc?.addresses && userDoc.addresses.length > 0) {
        const defAddr = userDoc.addresses.find(a => a.isDefault) || userDoc.addresses[0];
        primaryAddress = `${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.city || ''} ${defAddr.pincode || ''}`.trim();
        if (defAddr.coordinates && defAddr.coordinates.latitude) {
            coords = {
                latitude: defAddr.coordinates.latitude,
                longitude: defAddr.coordinates.longitude
            };
        }
      }

      // Create an order for tomorrow
      const newOrder = new Order({
        user: sub.user,
        items: [{
          product: sub.product._id,
          quantity: sub.quantity,
          priceAtBooking: sub.product.price
        }],
        totalAmount: sub.product.price * sub.quantity,
        status: 'Pending',
        deliveryAddress: primaryAddress,
        deliveryCoordinates: coords,
        orderType: 'Subscription-Generated',
        subscriptionRef: sub._id
      });

      await newOrder.save({ session });
      
      sub.lastOrderGeneratedAt = targetDate;
      await sub.save({ session });
    }

    await session.commitTransaction();
    console.log('Daily subscription cron job completed successfully.');
    return { success: true, message: 'Cron processed successfully' };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in daily subscription cron job:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Schedule it to run at 2 AM every night
const startCronJob = () => {
  cron.schedule('0 2 * * *', () => {
    processDailySubscriptions().catch(err => console.error(err));
  });
};

module.exports = {
  processDailySubscriptions,
  startCronJob
};
