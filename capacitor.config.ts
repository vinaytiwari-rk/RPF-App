import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rpfoundation.app',
  appName: 'समाहित',
  // The complete React build is packaged into every APK. Web deployments and
  // native releases are separate, deterministic release artifacts.
  webDir: 'dist',
  ios: { contentInset: 'automatic', backgroundColor: '#f8fafc' },
  android: { backgroundColor: '#f8fafc' },
};

export default config;
