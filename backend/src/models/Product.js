const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Milk', 'Grocery', 'Dairy', 'Vegetables','milk'], // Expand as needed
    default: 'Grocery'
  },
  image: {
    type: String, // URL or local path
    required: false
  },
  unit: {
    type: String,
    required: true,
    enum: ['ml', 'L', 'kg', 'g', 'pc', 'packet'],
    default: 'pc'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexing for faster searches
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
