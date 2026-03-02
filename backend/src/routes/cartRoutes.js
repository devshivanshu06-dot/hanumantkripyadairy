const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.use(auth); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/add', cartController.addItem);
router.post('/update', cartController.updateQuantity);
router.post('/clear', cartController.clearCart);

module.exports = router;
