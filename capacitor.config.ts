import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rpfoundation.app',
  appName: 'Samahit',
  // Keep a complete local build inside the APK so the app can always launch.
  // Regular web/content updates are deployed separately; native-only changes
  // still require a new APK.
  webDir: 'dist',
  ios: { contentInset: 'automatic', backgroundColor: '#f8fafc' },
  android: { backgroundColor: '#f8fafc' },
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'https://appapi.therpfoundation.org',
      '*.therpfoundation.org',
      '*.rpfoundation.org'
    ]
  },
  plugins: {
    CapacitorUpdater: { autoUpdate: false },
    CapacitorHttp: {
      enabled: true
    }
  }
};
export default config;
