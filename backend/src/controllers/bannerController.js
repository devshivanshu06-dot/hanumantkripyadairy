const Banner = require('../models/Banner');

// @desc    Get all active banners (for app)
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching banners' });
  }
};

// @desc    Get all banners (for admin)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching banners' });
  }
};

// @desc    Add a new banner
exports.addBanner = async (req, res) => {
  try {
    const { title, image, isActive, order } = req.body;
    
    if (!title || !image) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    const newBanner = new Banner({
      title,
      image,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ 
      error: 'Server error creating banner', 
      details: error.message,
      stack: error.stack 
    });
  }
};

// @desc    Update a banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, isActive, order } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    if (title) banner.title = title;
    if (image) banner.image = image;
    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating banner' });
  }
};

// @desc    Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ message: 'Banner removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting banner' });
  }
};
