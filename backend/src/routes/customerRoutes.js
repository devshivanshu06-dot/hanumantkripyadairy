const express = require('express');
const { getBookings, createBooking, getLedger, getNotifications, getLivestreams } = require('../controllers/customerController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/ledger', getLedger);
router.get('/notifications', getNotifications);
router.get('/livestreams', getLivestreams);

module.exports = router;