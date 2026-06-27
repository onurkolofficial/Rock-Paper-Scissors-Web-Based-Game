import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { CapacitorGameConnect } from '@openforge/capacitor-game-connect';
import { showInterstitialAd } from '../utils/ads';
import { Achievement } from '../utils/achievements';
import { PLAY_GAMES_CONFIG } from '../config/playGames';
import { STORAGE_KEYS } from '../config/storage';

export type Screen = 'menu' | 'single' | 'multi' | 'online' | 'settings' | 'stats' | 'leaderboard' | 'achievements';

interface AppContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  confirmExit: boolean;
  setConfirmExit: (val: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  userImageUrl: string;
  setUserImageUrl: (url: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isPlayGamesSignedIn: boolean;
  achievementToast: Achievement | null;  
  setAchievementToast: (toast: Achievement | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [confirmExit, setConfirmExit] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [isPlayGamesSignedIn, setIsPlayGamesSignedIn] = useState(false);

  // Try to load user name
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
  });

  // Try to load user image URL
  const [userImageUrl, setUserImageUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_IMAGE_URL) || '';
  });

  const handleSetUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    localStorage.setItem(STORAGE_KEYS.USER_CHANGED_NAME, 'true');
  };

  useEffect(() => {
    // We only initialize Play Games logic
    const initPlayGamesSilent = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await CapacitorGameConnect.signIn();
          
          if (result && result.player_name) {
             setIsPlayGamesSignedIn(true);
             const hasChangedName = localStorage.getItem(STORAGE_KEYS.USER_CHANGED_NAME) === 'true';
             if (!hasChangedName) {
               setUserName(result.player_name);
               localStorage.setItem(STORAGE_KEYS.USER_NAME, result.player_name);
             }
          }
          
          let wins = Number(localStorage.getItem(STORAGE_KEYS.STATS_WINS) || 0);
          let draws = Number(localStorage.getItem(STORAGE_KEYS.STATS_DRAWS) || 0);
          let totalScoreAmount = (wins * 100) + (draws * 20);
          
          try {
            if (totalScoreAmount > 0) {
              await CapacitorGameConnect.submitScore({
                leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID,
                totalScoreAmount: totalScoreAmount
              });
            }
            
            const remoteScore = await CapacitorGameConnect.getUserTotalScore({ leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID });
            if (remoteScore && remoteScore.player_score > totalScoreAmount) {
              const recoveredWins = Math.floor(remoteScore.player_score / 100);
              const recoveredDraws = Math.floor((remoteScore.player_score % 100) / 20);
              localStorage.setItem(STORAGE_KEYS.STATS_WINS, String(recoveredWins));
              localStorage.setItem(STORAGE_KEYS.STATS_DRAWS, String(recoveredDraws));
            }
          } catch (scoreErr) {
            console.warn('Silent Play Games score sync skipped:', scoreErr);
          }
        } catch (e) {
          console.warn('Silent Play Games sign-in skipped:', e);
        }
      }
    };
    
    initPlayGamesSilent();
  }, []);

  const loginWithGoogle = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await CapacitorGameConnect.signIn();
        
        const displayName = result.player_name || 'Oyuncu';
        setIsPlayGamesSignedIn(true);
        
        let wins = Number(localStorage.getItem(STORAGE_KEYS.STATS_WINS) || 0);
        let draws = Number(localStorage.getItem(STORAGE_KEYS.STATS_DRAWS) || 0);
        let totalScoreAmount = (wins * 100) + (draws * 20);
        
        try {
          if (totalScoreAmount > 0) {
            await CapacitorGameConnect.submitScore({
              leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID,
              totalScoreAmount: totalScoreAmount
            });
          }
          
          const remoteScore = await CapacitorGameConnect.getUserTotalScore({ leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID });
          if (remoteScore && remoteScore.player_score > totalScoreAmount) {
            const recoveredWins = Math.floor(remoteScore.player_score / 100);
            const recoveredDraws = Math.floor((remoteScore.player_score % 100) / 20);
            localStorage.setItem(STORAGE_KEYS.STATS_WINS, String(recoveredWins));
            localStorage.setItem(STORAGE_KEYS.STATS_DRAWS, String(recoveredDraws));
          }
        } catch (scoreError) {
          console.warn('Score sync error:', scoreError);
        }
        
        const hasChangedName = localStorage.getItem(STORAGE_KEYS.USER_CHANGED_NAME) === 'true';
        if (!hasChangedName) {
          localStorage.setItem(STORAGE_KEYS.USER_NAME, displayName);
          setUserName(displayName);
        }
        
        // Try to fetch profile image via GoogleSignIn on Android since Play Games SDK doesn't expose it here
        try {
          const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
          await GoogleSignIn.initialize({
            clientId: '455623071673-11ftsbe7pgvao1etk07dnka66rvobj09.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
          });
          const gResult = await GoogleSignIn.signIn();
          if (gResult.imageUrl) {
            localStorage.setItem(STORAGE_KEYS.USER_IMAGE_URL, gResult.imageUrl);
            setUserImageUrl(gResult.imageUrl);
          }
        } catch (imgError) {
          console.warn('Failed to get profile image via GoogleSignIn on Android:', imgError);
        }
      } else {
        // Fallback for web if needed
        const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
        await GoogleSignIn.initialize({
          clientId: '455623071673-11ftsbe7pgvao1etk07dnka66rvobj09.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });
        const result = await GoogleSignIn.signIn();
        const displayName = result.displayName || 'Oyuncu';
        const imageUrl = result.imageUrl || '';
        
        const hasChangedName = localStorage.getItem(STORAGE_KEYS.USER_CHANGED_NAME) === 'true';
        if (!hasChangedName) {
          localStorage.setItem(STORAGE_KEYS.USER_NAME, displayName);
          setUserName(displayName);
        }
        localStorage.setItem(STORAGE_KEYS.USER_IMAGE_URL, imageUrl);
        setUserImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
        await GoogleSignIn.signOut();
      }
    } catch (e) {
      console.warn('GoogleSignIn.signOut failed', e);
    }
    
    // Note: Play Games v2 SDK doesn't have a direct sign-out method in this Capacitor plugin.
    // Also clearing the state.
    setIsPlayGamesSignedIn(false);
    setUserName('');
    setUserImageUrl('');
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.USER_IMAGE_URL);
    localStorage.removeItem(STORAGE_KEYS.USER_CHANGED_NAME);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_IMAGE_URL, userImageUrl);
  }, [userImageUrl]);

  useEffect(() => {
    const attachBackButton = async () => {
      await CapacitorApp.addListener('backButton', () => {
        // Allow the app views to intercept the back button locally (e.g. to close modals/shops)
        if (typeof (window as any).spsShopBackHandler === 'function') {
          const handled = (window as any).spsShopBackHandler();
          if (handled) return;
        }

        if (typeof (window as any).spsOnlineBackHandler === 'function') {
          const handled = (window as any).spsOnlineBackHandler();
          if (handled) return;
        }

        if (currentScreen === 'single' || currentScreen === 'multi' || currentScreen === 'online') {
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
    if (screen === 'menu' && (currentScreen === 'single' || currentScreen === 'multi' || currentScreen === 'online')) {
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
      setUserName: handleSetUserName,
      userImageUrl,
      setUserImageUrl,
      loginWithGoogle,
      logout,
      isPlayGamesSignedIn,
      achievementToast,
      setAchievementToast
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
