import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Percent, Trophy, Minus, XCircle, Clock, Check, X } from 'lucide-react';
import { STORAGE_KEYS } from '../config/storage';

const StatsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();
  const { language, playSound } = useSettings();

  const [activeTab, setActiveTab] = useState<'single' | 'online'>('single');
  
  // Single Player Stats
  const [singleWins, setSingleWins] = useState(0);
  const [singleDraws, setSingleDraws] = useState(0);
  const [singleLosses, setSingleLosses] = useState(0);

  // Online Stats
  const [onlineWins, setOnlineWins] = useState(0);
  const [onlineDraws, setOnlineDraws] = useState(0);
  const [onlineLosses, setOnlineLosses] = useState(0);
  const [onlineHistory, setOnlineHistory] = useState<string[]>([]);

  useEffect(() => {
    setSingleWins(Number(localStorage.getItem(STORAGE_KEYS.STATS_WINS) || 0));
    setSingleDraws(Number(localStorage.getItem(STORAGE_KEYS.STATS_DRAWS) || 0));
    setSingleLosses(Number(localStorage.getItem(STORAGE_KEYS.STATS_LOSSES) || 0));
    
    setOnlineWins(Number(localStorage.getItem(STORAGE_KEYS.STATS_ONLINE_WINS) || 0));
    setOnlineDraws(Number(localStorage.getItem(STORAGE_KEYS.STATS_ONLINE_DRAWS) || 0));
    setOnlineLosses(Number(localStorage.getItem(STORAGE_KEYS.STATS_ONLINE_LOSSES) || 0));
    
    try {
      const historyJson = localStorage.getItem(STORAGE_KEYS.STATS_ONLINE_HISTORY);
      if (historyJson) {
        setOnlineHistory(JSON.parse(historyJson));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getActiveStats = () => {
    if (activeTab === 'single') {
      return { wins: singleWins, draws: singleDraws, losses: singleLosses };
    }
    return { wins: onlineWins, draws: onlineDraws, losses: onlineLosses };
  };

  const { wins, draws, losses } = getActiveStats();
  const total = wins + draws + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const goBack = () => {
    playSound('click');
    navigate('menu');
  };

  const toUpper = (str: string) => {
    if (!str) return '';
    return language === 'tr' ? str.toLocaleUpperCase('tr-TR') : str.toUpperCase();
  };

  const handleTabChange = (tab: 'single' | 'online') => {
    playSound('click');
    setActiveTab(tab);
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
          className="p-2 rounded-full hover:bg-slate-800 active:bg-slate-700 transition"
        >
          <ArrowLeft className="w-6 h-6 text-slate-300" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-wide ml-4 text-slate-100">
          {toUpper(t('stats_title'))}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full z-10 flex flex-col">
        
        {/* Tabs */}
        <div className="flex bg-black/40 p-1 rounded-2xl backdrop-blur-sm border border-white/5">
          <button
            onClick={() => handleTabChange('single')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === 'single' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {t('stats_tab_single')}
          </button>
          <button
            onClick={() => handleTabChange('online')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === 'online' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {t('stats_tab_online')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 space-y-6"
          >
            <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 border-4 border-white/10">
                <Percent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-display font-black text-white tracking-tighter mb-1">{winRate}%</h2>
              <p className="text-sm font-bold tracking-widest uppercase text-white/50">{t('stats_win_rate')}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/40 border border-white/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center shadow-xl">
                <Trophy className="w-6 h-6 text-white mb-2" />
                <span className="text-2xl font-bold text-white">{wins}</span>
                <span className="text-[10px] uppercase text-center tracking-widest text-white/50 mt-1">{t('stats_wins')}</span>
              </div>

              <div className="bg-black/40 border border-white/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center shadow-xl">
                <Minus className="w-6 h-6 text-white/60 mb-2" />
                <span className="text-2xl font-bold text-white">{draws}</span>
                <span className="text-[10px] uppercase text-center tracking-widest text-white/50 mt-1">{t('stats_draws')}</span>
              </div>

              <div className="bg-black/40 border border-white/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center shadow-xl">
                <XCircle className="w-6 h-6 text-red-400 mb-2" />
                <span className="text-2xl font-bold text-white">{losses}</span>
                <span className="text-[10px] uppercase text-center tracking-widest text-white/50 mt-1">{t('stats_losses')}</span>
              </div>
            </div>

            {activeTab === 'online' && onlineHistory.length > 0 && (
              <div className="bg-black/40 border border-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-white/50" />
                  <h3 className="text-xs font-bold tracking-widest uppercase text-white/70">
                    {t('stats_recent_matches')}
                  </h3>
                </div>
                <div className="flex gap-2 w-full">
                  {[...onlineHistory].reverse().map((res, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center border border-white/5 ${
                        res === 'win' ? 'bg-green-500/20 text-green-400' :
                        res === 'lose' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/60'
                      }`}
                    >
                      {res === 'win' && <Check className="w-5 h-5" />}
                      {res === 'lose' && <X className="w-5 h-5" />}
                      {res === 'draw' && <Minus className="w-5 h-5" />}
                    </div>
                  ))}
                  {[...Array(5 - onlineHistory.length)].map((_, idx) => (
                     <div key={`empty-${idx}`} className="flex-1 h-12 rounded-xl bg-white/5 border border-white/5" />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StatsMenu;
