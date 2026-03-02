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
    return jwt.sign(
      { id: userId, role }, 
      'your_jwt_secret_key_change_in_production', 
      { expiresIn: '30d' }
    );
  };
  
  module.exports = { generateOTP, isOTPExpired, generateToken };