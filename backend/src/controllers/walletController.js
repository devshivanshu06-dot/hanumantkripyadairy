const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ balance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { amount, description, paymentId } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.walletBalance += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      type: 'credit',
      description: description || 'Added to wallet',
      status: 'completed',
      paymentId
    });
    await transaction.save();

    res.json({ message: 'Money added successfully', balance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
