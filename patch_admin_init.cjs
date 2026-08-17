const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

const adminInit = `
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if credentials are provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
  }
}
`;

c = c.replace('import dotenv from \'dotenv\';', 'import dotenv from \'dotenv\';\n' + adminInit);

fs.writeFileSync('server.ts', c);
