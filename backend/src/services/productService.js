const Product = require('../models/Product');

const getAllProducts = async (filters = {}) => {
  return await Product.find({ isActive: true, ...filters });
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
