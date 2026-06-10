import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { useAppNavigation } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, Vibrate, VibrateOff, Info } from 'lucide-react';
import { GAME_VERSION } from '../version';

const SettingsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();
  const { soundEnabled, toggleSound, volume, setVolume, vibrationEnabled, toggleVibration, language, changeLanguage, vibrate, playSound } = useSettings();

  const handleToggleVibration = () => {
    playSound('click');
    toggleVibration();
    if (!vibrationEnabled) { // It was just turned on
      vibrate();
    }
  };

  const handleToggleSound = () => {
    playSound('click');
    toggleSound();
  };

  const handleChangeLanguage = (lang: string) => {
    playSound('click');
    changeLanguage(lang);
  };

  const goBack = () => {
    playSound('click');
    navigate('menu');
  };

  const toUpper = (str: string) => {
    if (!str) return '';
    return str.toLocaleUpperCase('tr-TR');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full text-slate-100 relative overflow-hidden font-sans bg-transparent">
      {/* Header */}
      <div className="flex items-center p-4 bg-black/20 border-b border-white/5 backdrop-blur-md z-10">
        <button 
          onClick={goBack}
          className="p-2 rounded-full active:bg-slate-800 transition"
        >
          <ArrowLeft className="w-6 h-6 text-slate-300" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-wide ml-4 text-slate-100">
          {toUpper(t('menu_settings'))}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full z-10">
        {/* Preferences */}
        <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-xl space-y-4">
          <button 
            onClick={handleToggleSound}
            className="w-full flex justify-between items-center py-3 px-2 active:opacity-70 transition"
          >
            <div className="flex items-center space-x-3 text-slate-200">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white/40" />}
              <span className="font-bold uppercase tracking-wide">{t('settings_sound')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${soundEnabled ? 'bg-white justify-end' : 'bg-white/10 justify-start'}`}>
              <motion.div layout className={`w-4 h-4 rounded-full shadow-sm ${soundEnabled ? 'bg-black' : 'bg-white/50'}`} />
            </div>
          </button>

          <div className="px-2 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">{t('settings_volume')}</span>
              <span className="text-xs font-mono text-white/40">{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={!soundEnabled}
              className={`w-full h-2 rounded-lg appearance-none outline-none transition-opacity ${soundEnabled ? 'bg-white/20 cursor-pointer opacity-100' : 'bg-white/5 cursor-not-allowed opacity-50'}`}
              style={soundEnabled ? {
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%, rgba(255, 255, 255, 0.1) 100%)`
              } : {}}
            />
          </div>

          <button 
            onClick={handleToggleVibration}
            className="w-full flex justify-between items-center py-3 px-2 border-b border-white/10 active:opacity-70 transition"
          >
            <div className="flex items-center space-x-3 text-slate-200">
              {vibrationEnabled ? <Vibrate className="w-5 h-5 text-white" /> : <VibrateOff className="w-5 h-5 text-white/40" />}
              <span className="font-bold uppercase tracking-wide">{t('settings_vibration')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${vibrationEnabled ? 'bg-white justify-end' : 'bg-white/10 justify-start'}`}>
              <motion.div layout className={`w-4 h-4 rounded-full shadow-sm ${vibrationEnabled ? 'bg-black' : 'bg-white/50'}`} />
            </div>
          </button>

          <div className="flex flex-col space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50 px-2">{t('settings_language')}</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleChangeLanguage('tr')}
                className={`flex-1 py-3 rounded-xl font-bold uppercase transition border ${language === 'tr' ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
              >
                Türkçe
              </button>
              <button 
                onClick={() => handleChangeLanguage('en')}
                className={`flex-1 py-3 rounded-xl font-bold uppercase transition border ${language === 'en' ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-3">
          <Info className="w-8 h-8 text-white mb-2" />
          <h3 className="font-display font-black tracking-widest text-xl text-white">{t('app_name')}</h3>
          <p className="text-sm font-mono text-white/60">
            {t('about_developer')} <span className="font-bold text-white">Onur KOL</span>
          </p>
          <p className="text-xs font-mono tracking-widest text-white/40 mt-1 uppercase">
            {t('about_version')} {GAME_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
