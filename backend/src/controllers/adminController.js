const User = require('../models/User');
const MilkBooking = require('../models/MilkBooking');
const Ledger = require('../models/Ledger');
const Livestream = require('../models/Livestream');

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
    const { analyzer_cam_url, packing_cam_url, combo_cam_url } = req.body;

    let livestreams = await Livestream.findOne();
    
    if (!livestreams) {
      livestreams = await Livestream.create({
        analyzer_cam_url: analyzer_cam_url || '',
        packing_cam_url: packing_cam_url || '',
        combo_cam_url: combo_cam_url || ''
      });
    } else {
      livestreams.analyzer_cam_url = analyzer_cam_url || '';
      livestreams.packing_cam_url = packing_cam_url || '';
      livestreams.combo_cam_url = combo_cam_url || '';
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
  try {
    const { user_id, date, litres_delivered, balance, bottle_returned } = req.body;

    if (!user_id || !date || litres_delivered === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = await Ledger.create({
      user_id,
      date,
      litres_delivered,
      balance: balance || 0,
      bottle_returned: bottle_returned || false,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Add ledger entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all ledger entries for table view
exports.getLedger = async (req, res) => {
  try {
    const { from_date, to_date, user_id } = req.query;

    let query = {};
    
    // Date range filter
    if (from_date || to_date) {
      query.date = {};
      if (from_date) query.date.$gte = new Date(from_date);
      if (to_date) query.date.$lte = new Date(to_date);
    }
    
    // User filter
    if (user_id) {
      query.user_id = user_id;
    }

    const ledgerEntries = await Ledger.find(query)
      .populate('user_id', 'name phone')
      .sort({ date: -1, createdAt: -1 });

    res.json(ledgerEntries);
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};