import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rpfoundation.app',
  appName: 'RPFoundation',
  // Always package the current web build inside the APK. This prevents a blank
  // launch screen when the remote deployment host is temporarily unavailable.
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc'
  },
  android: {
    backgroundColor: '#f8fafc'
  }
};

export default config;
