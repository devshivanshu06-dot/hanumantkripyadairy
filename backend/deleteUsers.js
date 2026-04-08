require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://shivanshugaur6:H6gDfqyH4phgCzby@cluster0.m1ou12e.mongodb.net/hanumantdairy?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const deleteUsers = async () => {
  await connectDB();
  try {
    const User = require('./src/models/User');
    const Order = require('./src/models/Order');
    const Subscription = require('./src/models/Subscription');
    const Transaction = require('./src/models/Transaction');
    const Ledger = require('./src/models/Ledger');

    // Delete all customers but keep admins if needed
    // Usually cleaner to delete all and re-login as admin
    console.log('Deleting all data...');
    await User.deleteMany({ role: 'customer' });
    await Order.deleteMany({});
    await Subscription.deleteMany({});
    await Transaction.deleteMany({});
    await Ledger.deleteMany({});
    
    console.log('All customer data deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting users:', error);
    process.exit(1);
  }
};

deleteUsers();
