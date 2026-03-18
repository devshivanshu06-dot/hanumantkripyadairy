const subscriptionService = require('../services/subscriptionService');
const { processDailySubscriptions } = require('../services/cronService');

const createSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.user.id, req.body);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByUserId(req.user.id);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const pauseSubscription = async (req, res) => {
  try {
    const { pausedUntil } = req.body;
    const subscription = await subscriptionService.pauseSubscription(req.params.id, pausedUntil);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resumeSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.resumeSubscription(req.params.id);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const skipDate = async (req, res) => {
  try {
    const { date } = req.body;
    const subscription = await subscriptionService.addSkipDate(req.params.id, date);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.params.id);
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const adminGetAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminUpdateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subscription = await subscriptionService.updateSubscription(req.params.id, { status });
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const triggerDailyCron = async (req, res) => {
  try {
    const result = await processDailySubscriptions();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubscription,
  getMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  skipDate,
  cancelSubscription,
  adminGetAllSubscriptions,
  adminUpdateSubscriptionStatus,
  triggerDailyCron
};
