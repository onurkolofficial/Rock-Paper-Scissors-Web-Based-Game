import React, { createContext, useContext, useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

export type Screen = 'menu' | 'single' | 'multi' | 'settings' | 'stats';

interface AppContextType {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  confirmExit: boolean;
  setConfirmExit: (val: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
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
    localStorage.setItem('sps_user_name', userName);
  }, [userName]);

  useEffect(() => {
    const attachBackButton = async () => {
      await CapacitorApp.addListener('backButton', () => {
        if (currentScreen === 'menu') {
          // If on main menu, show confirm exit for the app
          setConfirmExit(true);
        } else {
          // If in game or settings, show confirm to go to main menu
          setConfirmExit(true);
        }
      });
    };
    attachBackButton();
    
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [currentScreen]);

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigate: setCurrentScreen,
      confirmExit,
      setConfirmExit,
      userName,
      setUserName
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
