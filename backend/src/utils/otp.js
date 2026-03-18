const generateOTP = () => {
  return "000000";
};

const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = { generateOTP, isOTPExpired };
