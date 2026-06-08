import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onurkolofficial.spsgame',
  appName: 'Taş Kağıt Makas',
  webDir: 'dist',
  plugins: {
    GoogleSignIn: {
      clientId: '455623071673-56djgd6psbpeu8eovc3tvjm5v1omrlkg.apps.googleusercontent.com',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/games'],
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
