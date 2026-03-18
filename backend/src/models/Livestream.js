const mongoose = require('mongoose');

const livestreamSchema = new mongoose.Schema({
  analyzer_cam_url: {
    type: String,
    default: ''
  },
  packing_cam_url: {
    type: String,
    default: ''
  },
  combo_cam_url: {
    type: String,
    default: ''
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