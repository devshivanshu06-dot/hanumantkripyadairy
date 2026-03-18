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
    required: false
  },
  addresses: [{
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    landmark: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    isDefault: { type: Boolean, default: false }
  }],
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