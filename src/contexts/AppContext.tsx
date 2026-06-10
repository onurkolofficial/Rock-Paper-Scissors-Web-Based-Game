import React, { createContext, useContext, useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { showInterstitialAd } from '../utils/ads';

export type Screen = 'menu' | 'single' | 'multi' | 'settings' | 'stats' | 'leaderboard' | 'achievements';

interface AppContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  confirmExit: boolean;
  setConfirmExit: (val: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  loginWithGoogle: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [confirmExit, setConfirmExit] = useState(false);

  // Try to load user name
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('sps_user_name') || '';
  });

  useEffect(() => {
    try {
      // Google Play Integration
      // Initialize
      GoogleSignIn.initialize({
        clientId: '455623071673-o47c5upkvunf797g9vdtbsjrub59lb00.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/games'],
      });
    } catch (e) {
      console.error('Failed to initialize GoogleSignIn:', e);
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await GoogleSignIn.signIn();
      const displayName = result.displayName || 'Oyuncu';
      // Now update userName in AppContext.
      localStorage.setItem('sps_user_name', displayName);
      setUserName(displayName);
    } catch (error) {
      console.error("Login Error:", error);
      throw error; // Rethrow to show the error modal in MainMenu
    }
  };

  useEffect(() => {
    localStorage.setItem('sps_user_name', userName);
  }, [userName]);

  useEffect(() => {
    const attachBackButton = async () => {
      await CapacitorApp.addListener('backButton', () => {
        if (currentScreen === 'single' || currentScreen === 'multi') {
          // If in game show confirm to go to main menu
          setConfirmExit(true);
        } else if (currentScreen !== 'menu') {
          // If in settings or stats, just go back to menu without prompt
          setCurrentScreen('menu');
        } else {
          // If on main menu, show confirm exit for the app
          setConfirmExit(true);
        }
      });
    };
    attachBackButton();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [currentScreen]);

  const navigateWithAds = async (screen: Screen) => {
    // Show interstitial ad when exiting a game mode
    if (screen === 'menu' && (currentScreen === 'single' || currentScreen === 'multi')) {
      await showInterstitialAd();
    }
    setCurrentScreen(screen);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigate: navigateWithAds,
      confirmExit,
      setConfirmExit,
      userName,
      setUserName,
      loginWithGoogle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppNavigation must be used within AppProvider');
  return context;
};
