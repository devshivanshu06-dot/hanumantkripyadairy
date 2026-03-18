const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  litres_delivered: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  bottle_returned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ledger', ledgerSchema);