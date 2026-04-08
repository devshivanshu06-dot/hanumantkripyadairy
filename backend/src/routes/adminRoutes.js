const express = require('express');
const { getCustomers, updateCustomer, getCustomerDetails, getAllBookings, updateBooking, updateLivestreams, getMilkReport, addLedgerEntry,getLedger } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(adminAuth);

router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetails);
router.put('/customers/:id', updateCustomer);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id', updateBooking);
router.get('/milk-report', getMilkReport);
router.get('/ledger', getLedger);
router.post('/ledger', addLedgerEntry);
router.post('/livestreams', updateLivestreams);

module.exports = router;