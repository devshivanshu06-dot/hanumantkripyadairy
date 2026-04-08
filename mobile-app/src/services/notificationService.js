import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { authAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestUserPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      // Save locally to check if it changed
      const oldToken = await AsyncStorage.getItem('fcmToken');
      if (fcmToken !== oldToken) {
        await authAPI.updateFCMToken(fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

export const notificationListener = (navigation) => {
  // Assume a message-notification contains a "screen" property in the data payload of the remote message
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
    if (remoteMessage.data?.screen) {
        navigation.navigate(remoteMessage.data.screen);
    }
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        if (remoteMessage.data?.screen) {
            navigation.navigate(remoteMessage.data.screen);
        }
      }
    });

  return messaging().onMessage(async remoteMessage => {
    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body,
    );
  });
};
