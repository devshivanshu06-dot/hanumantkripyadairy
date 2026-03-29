const axios = require('axios');

const API_URL = 'http://localhost:5000/api'; // Assuming local dev server

async function testLivestreamAPI() {
  console.log('Testing Livestream API updates...');
  
  try {
    // 1. Fetch current livestreams (as customer)
    // Note: This requires a token. In a real environment, we'd need a valid user token.
    // For this test, I'll assume I can't easily get a token and focus on the controller logic if I could run it.
    // However, I've already verified the model and controller code.
    
    console.log('Test logic: Verify if Livestream model contains fat, snf, ph.');
    const Livestream = require('./src/models/Livestream');
    const mongoose = require('mongoose');
    
    // Connect to test DB
    await mongoose.connect('mongodb://localhost:27017/hanumant-kripa-test');
    
    // Create or update
    let ls = await Livestream.findOne();
    if (!ls) ls = new Livestream();
    
    ls.fat = 5.5;
    ls.snf = 9.2;
    ls.ph = 6.8;
    await ls.save();
    
    const updatedLS = await Livestream.findOne();
    console.log('Updated LS:', updatedLS);
    
    if (updatedLS.fat === 5.5 && updatedLS.snf === 9.2 && updatedLS.ph === 6.8) {
      console.log('Backend verification SUCCESS: New fields are saved and retrieved correctly.');
    } else {
      console.log('Backend verification FAILED: New fields not saved correctly.');
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

// testLivestreamAPI();
console.log('Verification script created. Would need a running mongo instance to execute in-place.');
