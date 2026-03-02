const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const createOrder = async (userId, deliveryAddress) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save({ session });

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtBooking: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'Pending'
    });

    await order.save({ session });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

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
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus
};
