const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.5
  },
  frequency: {
    type: String,
    enum: ['daily', 'alternate', 'custom'],
    default: 'daily'
  },
  timeSlot: {
    type: String,
    enum: ['Morning', 'Evening'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  pausedUntil: {
    type: Date
  },
  skipDates: [{
    type: Date
  }],
  lastOrderGeneratedAt: {
    type: Date
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
