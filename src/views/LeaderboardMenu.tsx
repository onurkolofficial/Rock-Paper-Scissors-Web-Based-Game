import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy } from 'lucide-react';

const mockLeaderboardData = [
  { rank: 1, name: 'Onur KOL', score: 15420, isCurrentPlayer: false },
  { rank: 2, name: 'ProGamer99', score: 14200, isCurrentPlayer: false },
  { rank: 3, name: 'RockMaster', score: 13550, isCurrentPlayer: false },
  { rank: 4, name: 'PaperCutter', score: 12100, isCurrentPlayer: false },
  { rank: 5, name: 'ScissorNinja', score: 11800, isCurrentPlayer: false },
  { rank: 6, name: 'Player One', score: 9500, isCurrentPlayer: true }, // Will be replaced by current user
  { rank: 7, name: 'Guest_9123', score: 8430, isCurrentPlayer: false },
  { rank: 8, name: 'NoobMaster', score: 7200, isCurrentPlayer: false },
];

const LeaderboardMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, userName } = useAppNavigation();
  const { playSound } = useSettings();
  const [data, setData] = useState(mockLeaderboardData);

  useEffect(() => {
    // Inject current user name for Demo purposes
    const winScore = Number(localStorage.getItem('sps_stats_wins') || 0) * 100; // Fake score calc: wins * 100
    const localScore = 9500 + winScore;
    
    setData(prev => prev.map(item => {
      if (item.isCurrentPlayer) {
        return { ...item, name: userName || 'Siz', score: localScore };
      }
      return item;
    }).sort((a,b) => b.score - a.score).map((item, index) => ({...item, rank: index + 1})));
  }, [userName]);

  const handleBack = () => {
    playSound('click');
    navigate('menu');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full text-slate-100 p-6 relative overflow-hidden font-sans bg-transparent">
      {/* Header */}
      <div className="flex items-center mb-8 z-10 pt-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/5 transition mr-4"
        >
          <ArrowLeft className="w-6 h-6 text-white/80" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-display font-black tracking-widest uppercase text-green-400 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {t('leaderboard') || 'SIRALAMA'}
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
            Google Play Oyunlar (Global)
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full max-w-md mx-auto overflow-y-auto space-y-2 pb-10 z-10 scrollbar-hide"
      >
        {/* Connection Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-3 rounded-xl text-xs flex flex-col gap-1 mb-4 shadow-lg backdrop-blur-sm">
          <span className="font-bold uppercase tracking-widest">Geliştirici Notu</span>
          <span className="text-white/70">Bu liste Demo amaçlıdır. Google Play Games REST API istekleri Leaderboard ID yapılandırması gerektirir.</span>
        </div>

        {data.map((player) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: player.rank * 0.05 }}
            className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm ${
              player.isCurrentPlayer 
                ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                : 'bg-black/40 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm ${
                player.rank === 1 ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50' :
                player.rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' :
                player.rank === 3 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' :
                'bg-white/5 text-white/50 border border-white/10'
              }`}>
                {player.rank}
              </div>
              <span className={`font-bold tracking-wide ${player.isCurrentPlayer ? 'text-green-300' : 'text-white/90'}`}>
                {player.name}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-widest text-white/40 mb-1">SKOR</span>
              <span className={`font-mono font-bold ${player.isCurrentPlayer ? 'text-green-400' : 'text-white'}`}>
                {player.score.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LeaderboardMenu;
