require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://hanumantkripyadairy:Z6BwN6nL9aA4p1E@test.m1ou12e.mongodb.net/hkdairy?retryWrites=true&w=majority';

async function test() {
  await mongoose.connect(dbURI);
  console.log('DB connected');
  
  const user = await User.findOne({});
  console.log('User addresses:', user.addresses);

  await mongoose.disconnect();
}
test();
