const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.get('/category/:category', productController.getProductsByCategory);

// Admin only routes
router.post('/', adminAuth, productController.createProduct);
router.put('/:id', adminAuth, productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
