import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { ArrowLeft, Target, Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS_LIST, isAchievementUnlocked } from '../utils/achievements';

const AchievementsMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();
  const { playSound } = useSettings();
  
  const [achievements, setAchievements] = useState(ACHIEVEMENTS_LIST);
  const [filter, setFilter] = useState<'all' | 'completed' | 'locked'>('all');

  useEffect(() => {
    // Read cached unlocked states without making redundant native API requests
    setAchievements(prev => prev.map(ach => ({
      ...ach,
      isUnlocked: isAchievementUnlocked(ach.id)
    })));
  }, []);

  const handleBack = () => {
    playSound('click');
    navigate('menu');
  };

  const handleFilterClick = (type: 'all' | 'completed' | 'locked') => {
    playSound('click');
    setFilter(type);
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  const filteredAchievements = achievements.filter(ach => {
    if (filter === 'completed') return ach.isUnlocked;
    if (filter === 'locked') return !ach.isUnlocked;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-[100dvh] w-full text-slate-100 p-6 relative overflow-hidden font-sans bg-transparent"
    >
      {/* Header */}
      <div className="flex items-center mb-6 z-10 pt-4 shrink-0">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/5 transition mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-white/80" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-display font-black tracking-widest uppercase text-yellow-400 flex items-center gap-2">
            <Target className="w-6 h-6" />
            {t('achievements') || 'HEDEFLER'}
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
            Google Play Oyunlar
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full max-w-md mx-auto flex flex-col z-10 min-h-0"
      >
        {/* Progress Bar */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-4 backdrop-blur-sm shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold tracking-widest text-white/50 uppercase">{t('filter_completed')}</span>
            <span className="text-xl font-black text-yellow-400">{unlockedCount} <span className="text-sm text-white/30">/ {totalCount}</span></span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-yellow-400 h-full shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4 p-1 bg-black/40 border border-white/5 rounded-xl shrink-0">
          <button
            onClick={() => handleFilterClick('all')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-200 ${
              filter === 'all' 
                ? 'bg-yellow-400 text-slate-900 shadow-[0_2px_10px_rgba(250,204,21,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('filter_all')}
          </button>
          <button
            onClick={() => handleFilterClick('completed')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-200 ${
              filter === 'completed' 
                ? 'bg-yellow-400 text-slate-900 shadow-[0_2px_10px_rgba(250,204,21,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('filter_completed')}
          </button>
          <button
            onClick={() => handleFilterClick('locked')}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-200 ${
              filter === 'locked' 
                ? 'bg-yellow-400 text-slate-900 shadow-[0_2px_10px_rgba(250,204,21,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('filter_locked')}
          </button>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-10 scrollbar-hide touch-pan-y">
          {filteredAchievements.map((ach, idx) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm relative overflow-hidden ${
                ach.isUnlocked 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-black/40 border-white/5 grayscale opacity-60'
              }`}
            >
              {ach.isUnlocked && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full decoration-wave" />
              )}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                ach.isUnlocked ? 'bg-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'bg-white/5'
              }`}>
                {ach.icon}
              </div>
              
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold tracking-wide ${ach.isUnlocked ? 'text-yellow-400' : 'text-white/80'}`}>
                    {t(ach.titleKey)}
                  </span>
                  {ach.isUnlocked ? (
                    <Award className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/30" />
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/50 leading-relaxed">
                  {t(ach.descKey)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementsMenu;
