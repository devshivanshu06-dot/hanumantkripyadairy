const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    type: String,
    required: false // Can be added during profile update or first checkout
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  otp: String,
  otp_expires_at: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);