const fs = require('fs');

// Fix src/utils/fcm.ts
let fcmTs = `import { getApps } from 'firebase-admin/app';
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
`;
fs.writeFileSync('src/utils/fcm.ts', fcmTs);

// Fix server.ts imports
let serverTs = fs.readFileSync('server.ts', 'utf8');
serverTs = serverTs.replace(
  "import * as admin from 'firebase-admin';", 
  "import { initializeApp, cert } from 'firebase-admin/app';"
);
serverTs = serverTs.replace(
  "admin.initializeApp({\n      credential: admin.credential.cert(serviceAccount)\n    });",
  "initializeApp({\n      credential: cert(serviceAccount)\n    });"
);
fs.writeFileSync('server.ts', serverTs);

// Fix src/firebase.ts import.meta.env
let fbTs = fs.readFileSync('src/firebase.ts', 'utf8');
fbTs = fbTs.replace(/import\.meta\.env/g, '(import.meta as any).env');
fs.writeFileSync('src/firebase.ts', fbTs);
