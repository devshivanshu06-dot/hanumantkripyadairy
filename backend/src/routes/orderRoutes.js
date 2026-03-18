const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// Customer routes
router.get('/my-orders', auth, orderController.getMyOrders);

// Admin routes
router.get('/admin/all', adminAuth, orderController.adminGetAllOrders);
router.put('/:id/status', adminAuth, orderController.adminUpdateStatus);

module.exports = router;
