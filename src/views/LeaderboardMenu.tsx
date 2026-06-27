import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { submitScoreToPlayGames } from '../utils/achievements';
import { CapacitorGameConnect } from '@openforge/capacitor-game-connect';
import { PLAY_GAMES_CONFIG } from '../config/playGames';
import { STORAGE_KEYS } from '../config/storage';

const defaultLeaderboardData: Array<{ rank: number; name: string; score: number; isCurrentPlayer: boolean }> = [];

const LeaderboardMenu: React.FC = () => {
  const { t } = useTranslation();
  const { navigate, userName } = useAppNavigation();
  const { playSound } = useSettings();
  const [data, setData] = useState<typeof defaultLeaderboardData>([]);

  useEffect(() => {
    // Current user's real wins and draws from localStorage
    const wins = Number(localStorage.getItem(STORAGE_KEYS.STATS_WINS) || 0);
    const draws = Number(localStorage.getItem(STORAGE_KEYS.STATS_DRAWS) || 0);
    let localScore = (wins * 100) + (draws * 20);
    
    // Check if we are on Android & attempt to sync or pull
    const syncLeaderboard = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Attempt to submit local fresh score before view
          await submitScoreToPlayGames(localScore);

          const remoteScore = await CapacitorGameConnect.getUserTotalScore({ leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID });
          if (remoteScore && remoteScore.player_score > localScore) {
            localScore = remoteScore.player_score;
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.warn("Could not load score programmatically:", errMsg);
        }
      }

      // Default: Only display current player's actual score
      setData([{
        rank: 1,
        name: userName || t('you_label') || 'Sen',
        score: localScore,
        isCurrentPlayer: true
      }]);
    };

    syncLeaderboard();
  }, [userName, t]);

  const handleBack = () => {
    playSound('click');
    navigate('menu');
  };

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
          <h2 className="text-2xl font-display font-black tracking-widest uppercase text-green-400 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {t('leaderboard') || 'SIRALAMA'}
          </h2>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono mt-1">
            {t('gplay_subtitle')}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full max-w-md mx-auto flex flex-col z-10 min-h-0"
      >
        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto space-y-2 pb-10 scrollbar-hide touch-pan-y">
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
                <span className="text-xs uppercase tracking-widest text-white/40 mb-1">{t('score_label')}</span>
                <span className={`font-mono font-bold ${player.isCurrentPlayer ? 'text-green-400' : 'text-white'}`}>
                  {player.score.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardMenu;
