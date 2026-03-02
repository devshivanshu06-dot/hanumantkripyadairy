const mongoose = require('mongoose');

const milkBookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cow', 'buffalo', 'mixed']
  },
  plan: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly']
  },
  litres_per_day: {
    type: Number,
    required: true,
    min: 0.5
  },
  start_date: {
    type: Date,
    required: true
  },
  amount_paid: {
    type: Number,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MilkBooking', milkBookingSchema);