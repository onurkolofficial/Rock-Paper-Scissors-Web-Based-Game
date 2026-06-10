import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from './contexts/AppContext';
import { useSettings } from './contexts/SettingsContext';
import { App as CapacitorApp } from '@capacitor/app';

import MainMenu from './views/MainMenu';
import SettingsMenu from './views/SettingsMenu';
import StatsMenu from './views/StatsMenu';
import SinglePlayerGame from './views/SinglePlayerGame';
import TwoPlayerGame from './views/TwoPlayerGame';
import LeaderboardMenu from './views/LeaderboardMenu';
import AchievementsMenu from './views/AchievementsMenu';
import ConfirmModal from './components/ConfirmModal';

const MainLayout: React.FC = () => {
  const { currentScreen, confirmExit, setConfirmExit, navigate } = useAppNavigation();
  const { playSound } = useSettings();
  const { t } = useTranslation();

  const handleConfirmExit = () => {
    playSound('click');
    setConfirmExit(false);
    if (currentScreen === 'menu') {
      CapacitorApp.exitApp();
    } else {
      navigate('menu');
    }
  };

  const handleCancelExit = () => {
    playSound('click');
    setConfirmExit(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu': return <MainMenu />;
      case 'single': return <SinglePlayerGame />;
      case 'multi': return <TwoPlayerGame />;
      case 'settings': return <SettingsMenu />;
      case 'stats': return <StatsMenu />;
      case 'leaderboard': return <LeaderboardMenu />;
      case 'achievements': return <AchievementsMenu />;
      default: return <MainMenu />;
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-gradient-to-br from-[#1c282f] via-[#161a1b] text-white to-[#2d261e] selection:bg-white/20">
      {renderScreen()}
      <ConfirmModal 
        isOpen={confirmExit}
        message={t('game_back_confirm')}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
};

export default MainLayout;
