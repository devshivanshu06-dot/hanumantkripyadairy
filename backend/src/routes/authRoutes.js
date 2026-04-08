const express = require('express');
const { sendOTP, verifyOTP, getProfile, updateProfile, adminLogin, getUsers, updateFCMToken } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/admin-login', adminLogin);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/fcm-token', auth, updateFCMToken);
router.get('/admin/users', adminAuth, getUsers);

module.exports = router;