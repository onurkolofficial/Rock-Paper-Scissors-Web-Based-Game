import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { ArrowLeft, Percent, Trophy, Minus, XCircle } from 'lucide-react';

const StatsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();
  const { playSound } = useSettings();

  const [wins, setWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [losses, setLosses] = useState(0);

  useEffect(() => {
    setWins(Number(localStorage.getItem('sps_stats_wins') || 0));
    setDraws(Number(localStorage.getItem('sps_stats_draws') || 0));
    setLosses(Number(localStorage.getItem('sps_stats_losses') || 0));
  }, []);

  const total = wins + draws + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const goBack = () => {
    playSound('click');
    navigate('menu');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full text-slate-100 relative overflow-hidden font-sans bg-transparent">
      {/* Header */}
      <div className="flex items-center p-4 bg-black/20 border-b border-white/5 backdrop-blur-md z-10">
        <button 
          onClick={goBack}
          className="p-2 rounded-full hover:bg-slate-800 active:bg-slate-700 transition"
        >
          <ArrowLeft className="w-6 h-6 text-slate-300" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-wide ml-4 text-slate-100">
          {t('stats_title')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 max-w-lg mx-auto w-full z-10">
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
      </div>
    </div>
  );
};

export default StatsMenu;
