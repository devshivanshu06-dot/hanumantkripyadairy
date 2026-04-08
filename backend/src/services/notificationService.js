const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const Notification = require('../models/Notification');

let firebaseApp = null;

const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} else {
  console.warn('Firebase service account key not found at:', serviceAccountPath);
  console.warn('Push notifications will be logged to console only.');
}

exports.sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const User = require('../models/User'); // Lazy load to avoid circular dependency
    const user = await User.findById(userId);
    
    // Save to Database for history
    await Notification.create({
      user: userId,
      title,
      message: body,
      type: data.type || 'general',
      data: data
    });

    if (!user || !user.fcmToken) return;

    const message = {
      notification: { title, body },
      data: data,
      token: user.fcmToken
    };

    if (firebaseApp) {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent push notification:', response);
      return response;
    } else {
      console.log('--- MOCK PUSH NOTIFICATION ---');
      console.log('Phone:', user.phone);
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
};
