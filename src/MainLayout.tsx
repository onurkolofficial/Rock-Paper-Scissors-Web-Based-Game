import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from './contexts/AppContext';
import { useSettings } from './contexts/SettingsContext';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'motion/react';

import MainMenu from './views/MainMenu';
import SettingsMenu from './views/SettingsMenu';
import StatsMenu from './views/StatsMenu';
import SinglePlayerGame from './views/SinglePlayerGame';
import TwoPlayerGame from './views/TwoPlayerGame';
import LeaderboardMenu from './views/LeaderboardMenu';
import AchievementsMenu from './views/AchievementsMenu';
import ConfirmModal from './components/ConfirmModal';

const MainLayout: React.FC = () => {
  const { currentScreen, confirmExit, setConfirmExit, navigate, achievementToast, setAchievementToast } = useAppNavigation();
  const { playSound } = useSettings();
  const { t } = useTranslation();

  // Handle achievement auto-dismiss timer
  useEffect(() => {
    if (achievementToast) {
      playSound('win'); // Optional feedback play sound
      const timer = setTimeout(() => {
        setAchievementToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievementToast, setAchievementToast, playSound]);



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
    <div className="w-full min-h-[100dvh] bg-gradient-to-br from-[#1c282f] via-[#161a1b] text-white to-[#2d261e] selection:bg-white/20 relative overflow-hidden">
      {renderScreen()}
      
      <ConfirmModal 
        isOpen={confirmExit}
        message={t('game_back_confirm')}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* Swipe-to-dismiss Top Achievement Banner */}
      {!Capacitor.isNativePlatform() && (
        <AnimatePresence>
          {achievementToast && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: -200, bottom: 0 }}
              dragElastic={0.15}
              onDragEnd={(event, info) => {
                if (info.offset.y < -35) {
                  setAchievementToast(null);
                }
              }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px] px-4 cursor-grab active:cursor-grabbing pointer-events-auto touch-none"
            >
              <div className="bg-slate-900/95 border-2 border-yellow-400/55 text-slate-100 p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl flex items-center gap-4 select-none relative overflow-hidden">
                {/* Progress loader accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/20 overflow-hidden rounded-t-full">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    className="h-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                  />
                </div>

                {/* Icon Container */}
                <div className="w-11 h-11 bg-yellow-400/15 border border-yellow-400/30 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.25)]">
                  {achievementToast.icon}
                </div>

                {/* Text metadata */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[10px] text-yellow-500 font-extrabold uppercase tracking-widest leading-none mb-1">
                    {t('achievements') || 'BAŞARI KAZANILDI'}
                  </p>
                  <h4 className="text-xs font-bold text-white truncate">
                    {t(achievementToast.titleKey)}
                  </h4>
                  <p className="text-[10px] text-white/50 leading-tight uppercase tracking-wide mt-1">
                    {t(achievementToast.descKey)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MainLayout;
