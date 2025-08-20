import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken, updatePushToken, getProfile } from './profile';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      await updatePushToken(null);
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    try { await savePushToken(token); } catch {}
  }

  return token;
}

export async function unregisterPushNotifications() {
  try {
    await updatePushToken(null);
  } catch {}
}

export async function ensurePushPreferenceRespected() {
  const profile = await getProfile();
  if (profile?.push_enabled === false) {
    await unregisterPushNotifications();
    return null;
  }
  return registerForPushNotificationsAsync();
}

export async function sendPushToExpoToken(token, title, body) {
  if (!token) return;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: token, title, body })
  });
}