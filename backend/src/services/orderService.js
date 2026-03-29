const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product');
};

const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 }).populate('user items.product');
};

const updateOrderStatus = async (orderId, status) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save({ session });

    // Deduct from wallet if status changed to Delivered and it wasn't already delivered
    if (status === 'Delivered' && previousStatus !== 'Delivered') {
      const user = await User.findById(order.user).session(session);
      if (user) {
        user.walletBalance -= order.totalAmount;
        await user.save({ session });

        // Create transaction record
        await Transaction.create([{
          userId: user._id,
          amount: order.totalAmount,
          type: 'debit',
          description: `Milk Delivery - ${order.orderType === 'Subscription-Generated' ? 'Subscription' : 'One-time Order'}`,
          status: 'completed'
        }], { session });
      }
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus
};
