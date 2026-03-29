const express = require('express');
const router = express.Router();
const { 
  getAllBanners, 
  getActiveBanners, 
  addBanner, 
  updateBanner, 
  deleteBanner 
} = require('../controllers/bannerController');
const { auth, adminAuth } = require('../middleware/auth');

// Public route for mobile app
router.get('/active', getActiveBanners);

// Admin routes
router.route('/')
  .get(adminAuth, getAllBanners)
  .post(adminAuth, addBanner);

router.route('/:id')
  .put(adminAuth, updateBanner)
  .delete(adminAuth, deleteBanner);

module.exports = router;
