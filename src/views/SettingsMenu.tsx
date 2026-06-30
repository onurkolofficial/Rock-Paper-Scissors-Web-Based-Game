import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { useAppNavigation } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, Vibrate, VibrateOff, Info, CloudUpload, CloudDownload, LogOut } from 'lucide-react';
import { GAME_VERSION } from '../version';
import { googleSignIn, getAccessToken, initAuth, firebaseLogout } from '../config/firebaseAuth';
import { syncDataToDrive, syncDataFromDrive } from '../config/googleDriveSave';
import { getAllLocalData, applyAllLocalData } from '../config/storage';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

const SettingsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, userName, setUserName } = useAppNavigation();
  const { soundEnabled, toggleSound, volume, setVolume, vibrationEnabled, toggleVibration, interstitialAdsEnabled, toggleInterstitialAds, language, changeLanguage, vibrate, playSound } = useSettings();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{title: string, msg: string} | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  
  const [confirmAction, setConfirmAction] = useState<'upload' | 'download' | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleSyncError = (err: any) => {
    setSyncMessage({
      title: toUpper(t('settings_drive_error_title') || 'HATA'),
      msg: err.message || 'Google Drive sync failed.'
    });
  };

  const executeUpload = async () => {
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }
      if (token) {
        setNeedsAuth(false);
        const localData = getAllLocalData();
        await syncDataToDrive(token, localData);
        setSyncMessage({
          title: toUpper(t('settings_drive_success_title') || 'BAŞARILI'),
          msg: t('settings_drive_success_upload') || 'Veriler Google Drive hesabınıza yedeklendi.'
        });
      }
    } catch (err) {
      handleSyncError(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const executeDownload = async () => {
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }
      if (token) {
        setNeedsAuth(false);
        const cloudData = await syncDataFromDrive(token);
        if (cloudData) {
          applyAllLocalData(cloudData);
          setSyncMessage({
            title: toUpper(t('settings_drive_success_title') || 'BAŞARILI'),
            msg: t('settings_drive_success_download') || 'Veriler geri yüklendi. Değişikliklerin etkili olması için uygulamayı yeniden başlatın.'
          });
        } else {
          setSyncMessage({
            title: toUpper(t('settings_drive_error_title') || 'HATA'),
            msg: t('settings_drive_error_not_found') || 'Google Drive hesabınızda kayıtlı veri bulunamadı.'
          });
        }
      }
    } catch (err) {
      handleSyncError(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFirebaseLogout = async () => {
    playSound('click');
    await firebaseLogout();
    setNeedsAuth(true);
  };

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
    return language === 'tr' ? str.toLocaleUpperCase('tr-TR') : str.toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-[100dvh] w-full text-slate-100 relative overflow-hidden font-sans bg-transparent"
    >
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
      <div className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full z-10 overflow-y-auto">
        {/* Preferences */}
        <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-xl space-y-4">
          
          <div className="px-2 pb-4 border-b border-white/10">
            <span className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">{t('settings_player_name')}</span>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('settings_player_name_placeholder')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-white/30 transition-colors"
            />
          </div>

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

          <button 
            onClick={() => { playSound('click'); toggleInterstitialAds(); }}
            className="w-full flex justify-between items-center py-3 px-2 border-b border-white/10 active:opacity-70 transition text-left"
          >
            <div className="flex flex-col items-start text-slate-200 pr-4">
              <span className="font-bold uppercase tracking-wide leading-tight">{t('settings_ads_interstitial')}</span>
              <span className="text-[10px] text-white/40 tracking-wider mt-1">Start.io</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 shrink-0 ${interstitialAdsEnabled ? 'bg-white justify-end' : 'bg-white/10 justify-start'}`}>
              <motion.div layout className={`w-4 h-4 rounded-full shadow-sm ${interstitialAdsEnabled ? 'bg-black' : 'bg-white/50'}`} />
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

        {/* Sync Data */}
        <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="block text-xs font-bold uppercase tracking-widest text-white/50">{t('settings_drive_sync') || 'GOOGLE DRIVE SYNC'}</span>
            {!needsAuth && (
              <button onClick={handleFirebaseLogout} className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1 active:scale-95 transition-all">
                <LogOut className="w-3 h-3" />
                {t('settings_drive_disconnect') || 'BAĞLANTIYI KES'}
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => { playSound('click'); setConfirmAction('upload'); }}
              disabled={isSyncing}
              className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 py-3 rounded-xl flex flex-col items-center justify-center gap-2 text-xs font-bold text-blue-400 active:scale-95 transition-all disabled:opacity-50"
            >
              <CloudUpload className="w-5 h-5" />
              <span>{isSyncing && confirmAction === 'upload' ? (t('settings_drive_uploading') || 'YÜKLENİYOR...') : (t('settings_drive_upload') || 'YEDEKLE')}</span>
            </button>
            <button
              onClick={() => { playSound('click'); setConfirmAction('download'); }}
              disabled={isSyncing}
              className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 py-3 rounded-xl flex flex-col items-center justify-center gap-2 text-xs font-bold text-green-400 active:scale-95 transition-all disabled:opacity-50"
            >
              <CloudDownload className="w-5 h-5" />
              <span>{isSyncing && confirmAction === 'download' ? (t('settings_drive_downloading') || 'İNDİRİLİYOR...') : (t('settings_drive_download') || 'GERİ YÜKLE')}</span>
            </button>
          </div>
          <p className="text-[10px] text-white/40 text-center font-mono leading-relaxed mt-2 px-2">
            {t('settings_drive_desc') || "İlerlemeni ve istatistiklerini Google Drive hesabında gizli klasöre yedekleyebilir veya geri yükleyebilirsin."}
          </p>
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
      <AlertModal 
        isOpen={!!syncMessage} 
        title={syncMessage?.title || ''}
        message={syncMessage?.msg || ''}
        onClose={() => {
          setSyncMessage(null);
          if (syncMessage?.title === 'BAŞARILI' && confirmAction === 'download') {
            window.location.reload();
          }
        }}
      />
      <ConfirmModal
        isOpen={!!confirmAction && !isSyncing}
        message={confirmAction === 'upload' 
          ? (t('settings_drive_confirm_upload') || "İlerleyişin Google Drive'a yüklensin mi? (Önceki yedeğin üzerine yazılır)")
          : (t('settings_drive_confirm_download') || "Yedeğin Google Drive'dan geri yüklensin mi? (Mevcut yerel ilerleyişinin üzerine yazılır)")
        }
        onConfirm={() => {
          if (confirmAction === 'upload') executeUpload();
          if (confirmAction === 'download') executeDownload();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </motion.div>
  );
};

export default SettingsMenu;
