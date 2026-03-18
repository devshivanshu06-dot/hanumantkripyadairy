const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

router.post('/', auth, addressController.addAddress);
router.put('/:id', auth, addressController.updateAddress);
router.delete('/:id', auth, addressController.deleteAddress);

module.exports = router;
