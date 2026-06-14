import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { Play, Users, Settings as SettingsIcon, LogOut, LogIn, BarChart2, Gamepad2 } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import AlertModal from '../components/AlertModal';
import { showBanner, hideBanner } from '../utils/ads';

const MainMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { navigate, userName, setUserName, userImageUrl, setUserImageUrl, loginWithGoogle } = useAppNavigation();

  const { toggleSound, playSound } = useSettings();

  useEffect(() => {
    showBanner();
    return () => {
      hideBanner();
    };
  }, []);

  const handleExit = () => {
    playSound('click');
    CapacitorApp.exitApp();
  };

  const toUpper = (str: string) => {
    if (!str) return '';
    return str.toLocaleUpperCase(i18n.language === 'tr' ? 'tr-TR' : 'en-US');
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLoginMock = async () => {
    playSound('click');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(t('login_error_message') || 'Google Play Oyunlar ile giriş yapılamadı.');
    }
  };

  const handleGoogleLogoutMock = () => {
    playSound('click');
    setUserName('');
    setUserImageUrl('');
  };

  const navigateWithSound = (view: any) => {
    playSound('click');
    navigate(view);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full text-slate-100 p-6 relative overflow-hidden font-sans bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center text-center mb-10 z-10"
      >
        {userName && userImageUrl && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 relative group"
          >
            <div className="absolute inset-0 bg-yellow-400/25 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
            <img 
              src={userImageUrl} 
              alt={userName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full border-2 border-yellow-400/60 shadow-xl object-cover relative z-10"
            />
          </motion.div>
        )}
        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-2">
          {toUpper(t('app_name'))}
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase mt-4">
          {userName ? userName : t('guest')}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 w-full max-w-md z-10"
      >
        <button
          onClick={() => navigateWithSound('single')}
          className="group relative w-full text-left overflow-hidden bg-white/10 hover:bg-white/15 p-4 rounded-2xl flex items-center justify-between border border-white/10 shadow-xl active:scale-95 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">{toUpper(t('menu_single_player'))}</span>
          </div>
          <span className="text-white/50 text-xs font-mono hidden sm:block">VS CPU</span>
        </button>

        <button
          onClick={() => navigateWithSound('multi')}
          className="group relative w-full text-left overflow-hidden bg-black/40 hover:bg-black/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-xl active:scale-95 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide text-white">{toUpper(t('menu_two_player'))}</span>
          </div>
          <span className="text-white/30 text-[10px] font-mono hidden sm:block">BÖLÜNMÜŞ EKRAN</span>
        </button>

        {userName ? (
          <div className="flex flex-col bg-black/40 border border-white/5 p-4 rounded-2xl shadow-xl mt-1 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {userImageUrl ? (
                  <img 
                    src={userImageUrl} 
                    alt={userName} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-yellow-400/30 object-cover shadow-sm bg-black/30" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg">
                    👤
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">Google Play</span>
                  <span className="font-bold tracking-wide text-white text-sm">{userName}</span>
                </div>
              </div>
              <button 
                onClick={handleGoogleLogoutMock}
                className="bg-red-500/10 text-red-400 border border-red-900/50 px-3 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
              >
                {toUpper(t('menu_logout') || 'Çıkış Yap')}
              </button>
            </div>
            {/* Play Games Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => navigateWithSound('leaderboard')}
                className="w-full bg-white/5 border border-white/10 py-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 text-[10px] font-bold text-green-400 active:scale-95 transition-all"
              >
                <div className="w-5 h-5 flex items-center justify-center">🏆</div>
                <span className="tracking-widest">{t('leaderboard') || 'SIRALAMA'}</span>
              </button>
              <button
                onClick={() => navigateWithSound('achievements')}
                className="w-full bg-white/5 border border-white/10 py-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 text-[10px] font-bold text-yellow-400 active:scale-95 transition-all"
              >
                <div className="w-5 h-5 flex items-center justify-center">🎯</div>
                 <span className="tracking-widest">{t('achievements') || 'HEDEFLER'}</span>
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLoginMock}
            className="w-full flex justify-center items-center space-x-2 p-4 mt-1 bg-green-600/20 border border-green-500/50 text-green-400 rounded-2xl shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:bg-green-600/30 active:scale-95 transition-all backdrop-blur-sm"
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider">{toUpper(t('login_google') || 'Play Games')}</span>
          </button>
        )}

        <div className="grid grid-cols-3 gap-2 mt-2">
          <button
            onClick={() => navigateWithSound('stats')}
            className="w-full bg-black/40 border border-white/5 py-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 text-[10px] font-bold text-white/80 active:scale-95 transition-all backdrop-blur-sm"
          >
            <BarChart2 className="w-5 h-5" /> {toUpper(t('menu_stats'))}
          </button>

          <button
            onClick={() => navigateWithSound('settings')}
            className="w-full bg-black/40 border border-white/5 py-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 text-[10px] font-bold text-white/80 active:scale-95 transition-all backdrop-blur-sm"
          >
            <SettingsIcon className="w-5 h-5" /> {toUpper(t('menu_settings'))}
          </button>

          <button
            onClick={handleExit}
            className="w-full bg-red-950/30 border border-red-900/50 py-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-red-900/40 text-[10px] font-bold text-red-400 active:scale-95 transition-all backdrop-blur-sm"
          >
            <LogOut className="w-5 h-5" /> {toUpper(t('menu_exit'))}
          </button>
        </div>
      </motion.div>
      <AlertModal 
        isOpen={!!errorMsg} 
        title={toUpper(t('login_error_title') || 'GİRİŞ BAŞARISIZ')}
        message={errorMsg || ''}
        onClose={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default MainMenu;
