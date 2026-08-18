import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rpfoundation.app',
  appName: 'RPFoundation',
  webDir: 'dist',
  server: {
    url: 'https://appapi.therpfoundation.org',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f8fafc'
  },
  android: {
    backgroundColor: '#f8fafc'
  }
};

export default config;
