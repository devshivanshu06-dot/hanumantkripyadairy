const axios = require('axios');

const sendMSG91OTP = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  
  if (!authKey || !templateId) {
    console.warn('MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is not set in environment variables. Mocking OTP send.', otp);
    // Keep it returning true if keys are missing to prevent breaking local dev
    return { success: true, message: 'Mock OTP sent (keys missing)' };
  }

  try {
    // Assuming Indian numbers by default for the +91 code prefix, as MSG91 requires country code
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone}&otp=${otp}`;
    const response = await axios.post(url, {}, {
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      }
    });
    console.log(response.data, phone,otp,url)
    return response.data;
  } catch (error) {
    console.error('Error sending MSG91 OTP:', error.response?.data || error.message);
    throw new Error('Failed to send OTP via MSG91');
  }
};

module.exports = { sendMSG91OTP };
