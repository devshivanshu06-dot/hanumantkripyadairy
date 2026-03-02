const express = require('express');
const { sendOTP, verifyOTP, getProfile, adminLogin, getUsers } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/admin-login', adminLogin);
router.get('/profile', auth, getProfile);
router.get('/admin/users', adminAuth, getUsers);

module.exports = router;