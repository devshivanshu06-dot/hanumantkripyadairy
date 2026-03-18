const orderService = require('../services/orderService');

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminUpdateStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMyOrders,
  adminGetAllOrders,
  adminUpdateStatus
};
