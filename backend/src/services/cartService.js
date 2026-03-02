const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCartByUserId = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }
  return cart;
};

const addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new Error('Product not found or inactive');
  }

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  // Recalculate total
  await cart.populate('items.product');
  cart.totalAmount = cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  return await cart.save();
};

const updateCartItemQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error('Cart not found');

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex === -1) throw new Error('Item not in cart');

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (product.stock < quantity) throw new Error('Insufficient stock');
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.populate('items.product');
  cart.totalAmount = cart.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  return await cart.save();
};

const clearCart = async (userId) => {
  return await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], totalAmount: 0 },
    { new: true }
  );
};

module.exports = {
  getCartByUserId,
  addToCart,
  updateCartItemQuantity,
  clearCart
};
