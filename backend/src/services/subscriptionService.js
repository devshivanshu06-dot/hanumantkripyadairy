const Subscription = require('../models/Subscription');
const Order = require('../models/Order');

const createSubscription = async (userId, subscriptionData) => {
  const subscription = new Subscription({
    user: userId,
    ...subscriptionData
  });
  return await subscription.save();
};

const getSubscriptionsByUserId = async (userId) => {
  return await Subscription.find({ user: userId }).populate('product');
};

const getAllSubscriptions = async () => {
  return await Subscription.find().populate('user product').sort({ createdAt: -1 });
};

const updateSubscription = async (subscriptionId, updateData) => {
  return await Subscription.findByIdAndUpdate(subscriptionId, updateData, { new: true });
};

const pauseSubscription = async (subscriptionId, pausedUntil) => {
  return await Subscription.findByIdAndUpdate(
    subscriptionId, 
    { status: 'paused', pausedUntil }, 
    { new: true }
  );
};

const resumeSubscription = async (subscriptionId) => {
  return await Subscription.findByIdAndUpdate(
    subscriptionId, 
    { status: 'active', pausedUntil: null }, 
    { new: true }
  );
};

const addSkipDate = async (subscriptionId, date) => {
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    { $addToSet: { skipDates: new Date(date) } },
    { new: true }
  );
};

const cancelSubscription = async (subscriptionId) => {
  return await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status: 'cancelled' },
    { new: true }
  );
};

module.exports = {
  createSubscription,
  getSubscriptionsByUserId,
  getAllSubscriptions,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  addSkipDate,
  cancelSubscription
};
