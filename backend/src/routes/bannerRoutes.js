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
  .get(auth, adminAuth, getAllBanners)
  .post(auth, adminAuth, addBanner);

router.route('/:id')
  .put(auth, adminAuth, updateBanner)
  .delete(auth, adminAuth, deleteBanner);

module.exports = router;
