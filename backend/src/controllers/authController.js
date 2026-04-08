const User = require('../models/User');
const { generateOTP, isOTPExpired, generateToken } = require('../utils/helpers');
const { sendMSG91OTP } = require('../services/msg91Service');

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(phone,'phone')
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const isTestAccount = phone === '9999999999';
    const otp = isTestAccount ? '000000' : generateOTP();
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

    // Send OTP via SMS service MSG91
    if (!isTestAccount) {
      console.log(`Sending OTP for ${phone}...`);
      await sendMSG91OTP(phone, otp);
    } else {
      console.log(`Skipping MSG91 for test account ${phone}`);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
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

    const isNewUser = user.name === `User ${user.phone}` || !user.is_verified;

    user.is_verified = true;
    user.otp = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      isNewUser,
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
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    // You can add email to schema if needed, for now just name
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log(phone,password,'kjd')

    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASSWORD;

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

exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.json({ success: true, message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};