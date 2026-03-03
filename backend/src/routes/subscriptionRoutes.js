const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth, adminAuth } = require('../middleware/auth');

// Customer routes
router.post('/', auth, subscriptionController.createSubscription);
router.get('/my-subscriptions', auth, subscriptionController.getMySubscriptions);
router.post('/:id/pause', auth, subscriptionController.pauseSubscription);
router.post('/:id/resume', auth, subscriptionController.resumeSubscription);
router.post('/:id/skip', auth, subscriptionController.skipDate);
router.post('/:id/cancel', auth, subscriptionController.cancelSubscription);

// Admin routes
router.get('/admin/all', adminAuth, subscriptionController.adminGetAllSubscriptions);
router.post('/admin/trigger-cron', adminAuth, subscriptionController.triggerDailyCron);
router.put('/:id/status', adminAuth, subscriptionController.adminUpdateSubscriptionStatus);

module.exports = router;
