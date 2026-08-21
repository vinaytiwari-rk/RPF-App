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
  plugins: { CapacitorUpdater: { autoUpdate: true } }
};
export default config;
