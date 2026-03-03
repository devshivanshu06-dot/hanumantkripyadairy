const User = require('../models/User');
const { generateOTP, isOTPExpired, generateToken } = require('../utils/helpers');

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
console.log(phone,'phone')
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000);

    let user = await User.findOne({ phone });

    if (user) {
      user.otp = otp;
      user.otp_expires_at = otpExpiresAt;
      await user.save();
    } else {
      user = await User.create({
        phone,
        name: `User ${phone}`,
        role: 'customer',
        otp,
        otp_expires_at: otpExpiresAt,
        is_verified: false
      });
    }

    // In production, send OTP via SMS service
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully', otp });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (isOTPExpired(user.otp_expires_at)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    user.is_verified = true;
    user.otp = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otp_expires_at');

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.createdAt,
      address: user.address,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log(phone,password,'kjd')

    const adminPhone = process.env.ADMIN_PHONE || '9999999999';
    const adminPassword = process.env.ADMIN_PASSWORD || '555555';

    if (phone !== adminPhone || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let user = await User.findOne({ phone, role: 'admin' });


    console.log(user,'kjihj')

    if (!user) {
      user = await User.create({
        phone,
        name: 'Admin',
        role: 'admin',
        is_verified: true
      });
    }

    const token = generateToken(user._id, 'admin');
    console.log(token)

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-otp -otp_expires_at').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};