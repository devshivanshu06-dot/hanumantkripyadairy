const cartService = require('../services/cartService');

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCartByUserId(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.id, productId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(req.user.id, productId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  clearCart
};
