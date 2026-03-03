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
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) throw new Error('Subscription not found');
  
  // Keep active until the next 30-day cycle ends
  const now = new Date();
  const startDate = new Date(subscription.startDate);
  
  let endDate = new Date(startDate);
  while (endDate <= now) {
    endDate.setDate(endDate.getDate() + 30);
  }
  
  subscription.cancelAtEnd = true;
  subscription.endDate = endDate;
  return await subscription.save();
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
