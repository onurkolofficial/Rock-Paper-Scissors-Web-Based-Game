import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import i18n from '../i18n';

interface SettingsContextType {
  soundEnabled: boolean;
  volume: number;
  vibrationEnabled: boolean;
  language: string;
  toggleSound: () => void;
  toggleVibration: () => void;
  changeLanguage: (lang: string) => void;
  setVolume: (val: number) => void;
  vibrate: (type?: 'short' | 'normal' | 'long') => void;
  playSound: (type: 'click' | 'draw' | 'lose' | 'win') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sps_sound') !== 'false';
  });
  const [volume, setVolumeState] = useState(() => {
    return parseFloat(localStorage.getItem('sps_volume') || '1.0');
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    return localStorage.getItem('sps_vibration') !== 'false';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sps_lang') || 'tr';
  });

  const clickAudio = useRef(new Audio('/Game_Effect_Button_Click.mp3'));
  const drawAudio = useRef(new Audio('/Game_Effect_Draw.mp3'));
  const loseAudio = useRef(new Audio('/Game_Effect_Lose.mp3'));
  const winAudio = useRef(new Audio('/Game_Effect_Win.mp3'));
  const bgmAudio = useRef(new Audio('/Game_BGM.mp3'));

  useEffect(() => {
    bgmAudio.current.loop = true;
  }, []);

  useEffect(() => {
    const vol = soundEnabled ? volume : 0;
    bgmAudio.current.volume = vol * 0.3; // bgm slightly quieter
    clickAudio.current.volume = vol;
    drawAudio.current.volume = vol;
    loseAudio.current.volume = vol;
    winAudio.current.volume = vol;
  }, [soundEnabled, volume]);

  useEffect(() => {
    if (soundEnabled) {
      bgmAudio.current.play().catch(() => {
        // Autoplay may be blocked
      });
    } else {
      bgmAudio.current.pause();
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('sps_sound', String(newVal));
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    localStorage.setItem('sps_volume', String(val));
    if (soundEnabled && bgmAudio.current.paused) {
         bgmAudio.current.play().catch(() => {});
    }
  };

  const toggleVibration = () => {
    const newVal = !vibrationEnabled;
    setVibrationEnabled(newVal);
    localStorage.setItem('sps_vibration', String(newVal));
  };

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('sps_lang', lang);
  };

  const vibrate = async (type: 'short' | 'normal' | 'long' = 'short') => {
    if (vibrationEnabled) {
      try {
        if (type === 'short') {
          await Haptics.impact({ style: ImpactStyle.Light });
        } else if (type === 'normal') {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } else if (type === 'long') {
          await Haptics.notification({ type: 'ERROR' as any });
        }
      } catch (e) {
        // Fallback for web
      }
      
      try {
        if (navigator && navigator.vibrate) {
          if (type === 'short') navigator.vibrate(50);
          else if (type === 'normal') navigator.vibrate(200);
          else navigator.vibrate(500);
        }
      } catch(e) {}
    }
  };

  const playSound = (type: 'click' | 'draw' | 'lose' | 'win') => {
    if (!soundEnabled) return;
    
    let audio: HTMLAudioElement;
    switch (type) {
      case 'click': audio = clickAudio.current; break;
      case 'draw': audio = drawAudio.current; break;
      case 'lose': audio = loseAudio.current; break;
      case 'win': audio = winAudio.current; break;
    }
    
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{
      soundEnabled,
      volume,
      vibrationEnabled,
      language,
      toggleSound,
      toggleVibration,
      changeLanguage,
      setVolume,
      vibrate,
      playSound
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
