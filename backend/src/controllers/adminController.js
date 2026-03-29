const mongoose = require('mongoose');
const User = require('../models/User');
const MilkBooking = require('../models/MilkBooking');
const Ledger = require('../models/Ledger');
const Livestream = require('../models/Livestream');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name phone role is_active createdAt')
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const customer = await User.findByIdAndUpdate(
      id,
      { name, is_active },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await MilkBooking.find()
      .populate('user_id', 'name phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { litres_per_day, payment_status } = req.body;

    const booking = await MilkBooking.findByIdAndUpdate(
      id,
      { litres_per_day, payment_status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateLivestreams = async (req, res) => {
  try {
    const { youtube_url, fat, snf, ph } = req.body;

    let livestreams = await Livestream.findOne();
    
    if (!livestreams) {
      livestreams = await Livestream.create({
        youtube_url: youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        fat: fat || 4.5,
        snf: snf || 8.5,
        ph: ph || 6.7
      });
    } else {
      livestreams.youtube_url = youtube_url || livestreams.youtube_url;
      livestreams.fat = fat !== undefined ? fat : livestreams.fat;
      livestreams.snf = snf !== undefined ? snf : livestreams.snf;
      livestreams.ph = ph !== undefined ? ph : livestreams.ph;
      await livestreams.save();
    }

    res.json(livestreams);
  } catch (error) {
    console.error('Update livestreams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMilkReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    let query = {};
    if (from_date || to_date) {
      query.date = {};
      if (from_date) query.date.$gte = new Date(from_date);
      if (to_date) query.date.$lte = new Date(to_date);
    }

    const ledgerData = await Ledger.find(query)
      .sort({ date: -1 });

    const summary = {
      total_litres_delivered: 0,
      dates: {},
    };

    ledgerData.forEach((entry) => {
      summary.total_litres_delivered += entry.litres_delivered;
      const dateStr = entry.date.toISOString().split('T')[0];
      if (!summary.dates[dateStr]) {
        summary.dates[dateStr] = 0;
      }
      summary.dates[dateStr] += entry.litres_delivered;
    });

    res.json(summary);
  } catch (error) {
    console.error('Get milk report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addLedgerEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { user_id, date, litres_delivered, balance, bottle_returned } = req.body;

    if (!user_id || !date || litres_delivered === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await Ledger.create([{
      user_id,
      date,
      litres_delivered,
      balance: balance || 0,
      bottle_returned: bottle_returned || false,
    }], { session });

    // Deduct from wallet
    if (balance && balance > 0) {
      const user = await User.findById(user_id).session(session);
      if (user) {
        user.walletBalance -= balance;
        await user.save({ session });

        // Create transaction record
        await Transaction.create([{
          userId: user._id, // Use userId instead of user_id to match Transaction schema
          amount: balance,
          type: 'debit',
          description: `Milk Delivery (Manual Ledger)`,
          status: 'completed'
        }], { session });
      }
    }

    await session.commitTransaction();
    res.status(201).json(entry[0]);
  } catch (error) {
    await session.abortTransaction();
    console.error('Add ledger entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};


// Get all ledger entries for table view
exports.getLedger = async (req, res) => {
  try {
    const { from_date, to_date, user_id } = req.query;

    let ledgerQuery = {};
    let orderQuery = {};
    
    // Date range filter
    if (from_date || to_date) {
      ledgerQuery.date = {};
      orderQuery.createdAt = {};
      if (from_date) {
        ledgerQuery.date.$gte = new Date(from_date);
        orderQuery.createdAt.$gte = new Date(from_date);
      }
      if (to_date) {
        ledgerQuery.date.$lte = new Date(to_date);
        orderQuery.createdAt.$lte = new Date(to_date);
      }
    }
    
    // User filter
    if (user_id) {
      ledgerQuery.user_id = user_id;
      orderQuery.user = user_id;
    }

    // Status filter for orders
    orderQuery.status = 'Delivered';

    // Fetch both manual ledger entries AND delivered orders
    const [ledgerEntries, deliveredOrders] = await Promise.all([
      Ledger.find(ledgerQuery).populate('user_id', 'name phone').sort({ date: -1 }),
      Order.find(orderQuery).populate('user', 'name phone').populate('items.product', 'name').sort({ createdAt: -1 })
    ]);

    // Format orders as ledger entries
    const orderEntries = deliveredOrders.map(order => ({
      _id: order._id,
      user_id: order.user,
      date: order.createdAt,
      createdAt: order.createdAt,
      litres_delivered: order.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      balance: order.totalAmount,
      bottle_returned: true, // Assuming delivery implies bottle returned or managed
      isOrder: true,
      label: order.items.map(i => i.product?.name).join(', ')
    }));

    // Combine and sort
    const combined = [...ledgerEntries, ...orderEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(combined);
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};