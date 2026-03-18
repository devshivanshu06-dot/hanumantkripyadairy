const MilkBooking = require('../models/MilkBooking');
const Ledger = require('../models/Ledger');
const Notification = require('../models/Notification');
const Livestream = require('../models/Livestream');

exports.getBookings = async (req, res) => {
  try {
    const bookings = await MilkBooking.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { type, plan, litres_per_day, start_date, amount_paid } = req.body;

    if (!type || !plan || !litres_per_day || !start_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = await MilkBooking.create({
      user_id: req.user.id,
      type,
      plan,
      litres_per_day,
      start_date,
      amount_paid: amount_paid || 0,
      payment_status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const ledger = await Ledger.find({ user_id: req.user.id })
      .sort({ date: -1 });

    res.json(ledger);
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { user_id: null },
        { user_id: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLivestreams = async (req, res) => {
  try {
    const livestreams = await Livestream.getLivestreams();
    res.json(livestreams);
  } catch (error) {
    console.error('Get livestreams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};