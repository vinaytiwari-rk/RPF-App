import { getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export const sendPushNotification = async (fcmToken: string, title: string, body: string) => {
  try {
    if (!getApps().length) return false;
    if (!fcmToken) return false;
    
    await getMessaging().send({
      token: fcmToken,
      notification: { title, body },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // Optional for app routing
      }
    });
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
