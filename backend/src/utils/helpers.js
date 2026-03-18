// Generate OTP
const jwt = require('jsonwebtoken');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Check if OTP is expired
  const isOTPExpired = (otpExpiresAt) => {
    return new Date() > new Date(otpExpiresAt);
  };
  
  // Generate JWT Token
  const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
    return jwt.sign(
      { id: userId, role }, 
      secret, 
      { expiresIn: '30d' }
    );
  };
  
  module.exports = { generateOTP, isOTPExpired, generateToken };