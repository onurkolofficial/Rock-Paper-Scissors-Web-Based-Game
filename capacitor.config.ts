import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onurkolofficial.spsgame',
  appName: 'Taş Kağıt Makas',
  webDir: 'dist',
  plugins: {
    GoogleSignIn: {
      clientId: '455623071673-11ftsbe7pgvao1etk07dnka66rvobj09.apps.googleusercontent.com',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/games'],
    }
  }
};

export default config;
