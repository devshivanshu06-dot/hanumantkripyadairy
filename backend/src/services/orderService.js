const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const getOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product');
};

const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 }).populate('user items.product');
};

const updateOrderStatus = async (orderId, status) => {
  return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

module.exports = {
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus
};
