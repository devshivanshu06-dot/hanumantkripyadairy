const mongoose = require('mongoose');

const livestreamSchema = new mongoose.Schema({
  youtube_url: {
    type: String,
    default: ''
  },
  fat: {
    type: Number,
    default: 4.5
  },
  snf: {
    type: Number,
    default: 8.5
  },
  ph: {
    type: Number,
    default: 6.7
  }
}, {
  timestamps: true
});

// Create single document
livestreamSchema.statics.getLivestreams = async function() {
  let livestream = await this.findOne();
  if (!livestream) {
    livestream = await this.create({});
  }
  return livestream;
};

module.exports = mongoose.model('Livestream', livestreamSchema);