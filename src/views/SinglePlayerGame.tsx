import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Move, Result, determineWinner, getRandomMove, MOVES } from '../model/GameModel';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingBag, Coins, Check, Lock as LockIcon, X } from 'lucide-react';
import { checkSinglePlayerAchievements, unlockAchievement, submitScoreToPlayGames } from '../utils/achievements';

import StoreModal, { Skin, SKINS_LIST } from '../components/StoreModal';

const MoveIcon = ({ 
  move, 
  className, 
  skinEmoji 
}: { 
  move: Move; 
  className?: string; 
  skinEmoji?: React.ReactNode;
}) => {
  if (move === 'iron') {
    return <img src="/gfx_iron.png" alt="Iron" className={className} />;
  }
  if (skinEmoji) {
    const isSmall = className?.includes('w-7') || className?.includes('w-8');
    const sizeClass = isSmall ? 'text-2xl sm:text-4xl' : 'text-6xl sm:text-7xl';
    return (
      <div className={`${className} flex items-center justify-center`}>
        <span className={`${sizeClass} drop-shadow-md select-none leading-none`}>{skinEmoji}</span>
      </div>
    );
  }
  if (move === 'rock') return <img src="/gfx_stone.png" alt="Rock" className={className} />;
  if (move === 'paper') return <img src="/gfx_paper.png" alt="Paper" className={className} />;
  return <img src="/gfx_scissors.png" alt="Scissors" className={className} />;
};

const SinglePlayerGame: React.FC = () => {
  const { t } = useTranslation();
  const { setConfirmExit, setAchievementToast } = useAppNavigation();
  const { vibrate, playSound } = useSettings();

  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [computerMove, setComputerMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ player: 0, computer: 0, draws: 0 });
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Shop & Skins state
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [ironCount, setIronCount] = useState<number>(() => {
    return Number(localStorage.getItem('sps_iron_count') || 0);
  });
  const [virtualCash, setVirtualCash] = useState(() => {
    return Number(localStorage.getItem('sps_stats_cash') || 0);
  });
  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    const list = localStorage.getItem('sps_owned_skins');
    return list ? JSON.parse(list) : ['default'];
  });
  const [activeSkinId, setActiveSkinId] = useState(() => {
    return localStorage.getItem('sps_active_skin') || 'default';
  });

  const activeSkin = SKINS_LIST.find(s => s.id === activeSkinId) || SKINS_LIST[0];

  useEffect(() => {
    localStorage.setItem('sps_stats_cash', String(virtualCash));
  }, [virtualCash]);

  useEffect(() => {
    localStorage.setItem('sps_iron_count', String(ironCount));
  }, [ironCount]);

  useEffect(() => {
    localStorage.setItem('sps_owned_skins', JSON.stringify(ownedSkins));
  }, [ownedSkins]);

  useEffect(() => {
    localStorage.setItem('sps_active_skin', activeSkinId);
  }, [activeSkinId]);

  // Hook up the global back button interceptor to close the shop if open
  useEffect(() => {
    if (isShopOpen) {
      (window as any).spsShopBackHandler = () => {
        setIsShopOpen(false);
        return true;
      };
    } else {
      delete (window as any).spsShopBackHandler;
    }
    return () => {
      delete (window as any).spsShopBackHandler;
    };
  }, [isShopOpen]);

  const handleExitClick = () => {
    playSound('click');
    setConfirmExit(true);
  };

  const handlePlay = (move: Move) => {
    if (isPlaying) return;
    
    // Decrement iron count if player chose iron
    if (move === 'iron') {
      if (ironCount <= 0) return;
      setIronCount(prev => prev - 1);
      // Auto unlock Ach 9 (Ürün!)
      unlockAchievement('t9', (ach) => {
        setAchievementToast(ach);
      });
    }

    playSound('click');
    vibrate();
    setPlayerMove(move);
    setIsPlaying(true);
    setComputerMove(null);
    setResult(null);

    // Simulate thinking delay
    setTimeout(() => {
      const cMove = getRandomMove();
      setComputerMove(cMove);
      
      const matchResult = determineWinner(move, cMove);
      setResult(matchResult);
      
      let nextStreak = 0;
      if (matchResult === 'win') {
        const nextScore = score.player + 1;
        setScore(s => ({ ...s, player: nextScore }));
        nextStreak = streak + 1;
        setStreak(nextStreak);
        
        // Update stats matches wins
        const totalWins = Number(localStorage.getItem('sps_stats_wins') || 0) + 1;
        localStorage.setItem('sps_stats_wins', String(totalWins));
        
        // Submit the updated high score to Play Games leaderboard!
        const totalDrawsValue = Number(localStorage.getItem('sps_stats_draws') || 0);
        submitScoreToPlayGames((totalWins * 100) + (totalDrawsValue * 20));
        
        // Reward $100 Cash per win
        const nextCash = virtualCash + 100;
        setVirtualCash(nextCash);

        playSound('win');
        vibrate('normal');

        // Evaluate Single Player Achievements (wins, streaks, score milestones, cash triggers)
        checkSinglePlayerAchievements(nextStreak, totalWins, totalDrawsValue, (ach) => {
          setAchievementToast(ach);
        });

      } else if (matchResult === 'lose') {
        setScore(s => ({ ...s, computer: s.computer + 1 }));
        setStreak(0);
        
        const totalLosses = Number(localStorage.getItem('sps_stats_losses') || 0) + 1;
        localStorage.setItem('sps_stats_losses', String(totalLosses));
        
        playSound('lose');
        vibrate('long');

        const totalWins = Number(localStorage.getItem('sps_stats_wins') || 0);
        const totalDraws = Number(localStorage.getItem('sps_stats_draws') || 0);
        checkSinglePlayerAchievements(0, totalWins, totalDraws, (ach) => {
          setAchievementToast(ach);
        });

      } else {
        const nextDraws = score.draws + 1;
        setScore(s => ({ ...s, draws: nextDraws }));
        setStreak(0);
        
        const totalDraws = Number(localStorage.getItem('sps_stats_draws') || 0) + 1;
        localStorage.setItem('sps_stats_draws', String(totalDraws));

        playSound('draw');
        vibrate('normal');

        const totalWins = Number(localStorage.getItem('sps_stats_wins') || 0);
        
        // Let draws increase the leaderboard score by 20 points
        submitScoreToPlayGames((totalWins * 100) + (totalDraws * 20));

        checkSinglePlayerAchievements(0, totalWins, totalDraws, (ach) => {
          setAchievementToast(ach);
        });
      }
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    }, 800);
  };

  const handlePurchaseSkin = (skin: Skin) => {
    playSound('click');
    if (virtualCash >= skin.cost) {
      setVirtualCash(prev => prev - skin.cost);
      setOwnedSkins(prev => [...prev, skin.id]);
      
      // Auto unlock Ach 8 (Alışveriş!)
      unlockAchievement('t8', (ach) => {
        setAchievementToast(ach);
      });
    } else {
      alert(t('shop_insufficient_cash'));
    }
  };

  const handlePurchaseIron = (count: number, cost: number) => {
    playSound('click');
    if (virtualCash >= cost) {
      setVirtualCash(prev => prev - cost);
      setIronCount(prev => prev + count);
      
      // Auto unlock Ach 8 (Alışveriş!)
      unlockAchievement('t8', (ach) => {
        setAchievementToast(ach);
      });
    } else {
      alert(t('shop_insufficient_cash'));
    }
  };

  const handleEquipSkin = (skinId: string) => {
    playSound('click');
    setActiveSkinId(skinId);
    
    // If equipping a purchased skin (non-default), unlock Ach 9 (Ürün!)
    if (skinId !== 'default') {
      unlockAchievement('t9', (ach) => {
        setAchievementToast(ach);
      });
    }
  };

  const getResultText = () => {
    if (result === 'win') return t('game_win');
    if (result === 'lose') return t('game_lose');
    if (result === 'draw') return t('game_draw');
    return '';
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full font-sans text-slate-100 overflow-hidden relative bg-transparent">
      {/* Unified Upper Navigation Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-black/20 backdrop-blur-md border-b border-white/5 absolute top-0 w-full z-10 gap-2">
        <button 
          onClick={handleExitClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 active:bg-white/5 transition shrink-0"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
        </button>

        {/* Global Persistent Stats: High Score & Virtual Cash */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-black/40 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/5 shadow-inner">
          <div className="flex items-center gap-1">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-green-400 font-extrabold">{t('score_label')}</span>
            <span className="text-xs sm:text-xs font-black font-mono text-green-300">
              {((Number(localStorage.getItem('sps_stats_wins') || 0) * 100) + (Number(localStorage.getItem('sps_stats_draws') || 0) * 20)).toLocaleString()}
            </span>
          </div>

          <div className="w-[1px] h-3 bg-white/10" />

          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
            <span className="text-xs sm:text-xs font-black font-mono text-yellow-300">${virtualCash.toLocaleString()}</span>
          </div>
        </div>

        {/* Shop Trigger integrated directly inside the header */}
        <button 
          onClick={() => { playSound('click'); setIsShopOpen(true); }}
          className="flex items-center gap-1 py-1.5 px-2 sm:px-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 active:bg-yellow-400/30 border border-yellow-400/30 hover:border-yellow-400/50 rounded-xl transition-all duration-200 text-[9px] font-black text-yellow-400 tracking-widest uppercase cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[9px] sm:text-[10px]">{t('game_shop')}</span>
        </button>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 flex flex-col items-center justify-center relative mt-16 pb-32">
        {/* Match scoreboard for active session */}
        <div className="absolute top-4 flex items-center gap-4 sm:gap-6 bg-black/35 px-4 py-[6px] -mt-5 ml-0 rounded-2xl border border-white/5 shadow-md z-10">
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-widest text-green-400/80 font-extrabold">{t('game_wins')}</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">{score.player}</span>
          </div>
          <div className="w-[1px] h-5 bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-widest text-white/50 font-extrabold">{t('game_draws')}</span>
            <span className="text-xs sm:text-sm font-bold text-white/60 font-mono">{score.draws}</span>
          </div>
          <div className="w-[1px] h-5 bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-widest text-red-400/80 font-extrabold">{t('game_losses')}</span>
            <span className="text-xs sm:text-sm font-bold text-white/80 font-mono">{score.computer}</span>
          </div>
        </div>

        {/* Computer Side */}
        <div className="flex-1 flex items-center justify-center w-full relative">
          <AnimatePresence mode="popLayout">
            {computerMove ? (
              <motion.div
                key="computer-move"
                initial={{ scale: 0, y: -50, rotate: 180 }}
                animate={{ scale: 1, y: 0, rotate: 180 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-28 h-28 sm:w-36 sm:h-36 bg-white/5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center p-5 sm:p-7 border-4 border-white/10 text-white/80"
              >
                <MoveIcon 
                  move={computerMove} 
                  className="w-full h-full" 
                  skinEmoji={activeSkinId !== 'default' ? activeSkin.emoji[computerMove] : undefined}
                />
              </motion.div>
            ) : (
              <motion.div
                key="computer-waiting"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center text-white/20 rotate-180"
              >
                <span className="text-lg font-bold tracking-widest uppercase">?</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Center */}
        <div className="h-24 flex items-center justify-center w-full z-10">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-3xl sm:text-4xl font-display font-black uppercase tracking-widest filter drop-shadow-lg text-white"
              >
                {getResultText()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Side */}
        <div className="flex-1 flex items-center justify-center w-full">
          <AnimatePresence mode="popLayout">
            {playerMove ? (
              <motion.div
                key="player-move"
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-28 h-28 sm:w-36 sm:h-36 bg-white/10 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center p-5 sm:p-7 border-4 border-white/20 text-white"
              >
                <MoveIcon 
                  move={playerMove} 
                  className="w-full h-full" 
                  skinEmoji={activeSkinId !== 'default' ? activeSkin.emoji[playerMove] : undefined}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Container */}
      <div className="absolute bottom-0 w-full p-6 pb-8 bg-black/40 backdrop-blur-xl border-t border-white/5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 shadow-lg"
            >
              <span className="font-bold text-white tracking-widest uppercase text-xs">{t('game_streak')} x{streak}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 sm:gap-4 max-w-lg mx-auto flex-nowrap animate-fade-in">
          {[...MOVES, ...(ironCount > 0 ? ['iron' as Move] : [])].map((m) => (
            <button
              key={m}
              onClick={() => handlePlay(m)}
              disabled={isPlaying}
              className={`w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 shadow-xl transition-all active:scale-95 relative shrink-0
                ${isPlaying ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30' 
                : 'bg-white/10 hover:bg-white/20 text-white border-b-4 border-black/50 active:border-b-0 active:translate-y-1'}`}
            >
              <MoveIcon 
                move={m} 
                className="w-7 h-7 sm:w-11 sm:h-11" 
                skinEmoji={m !== 'iron' && activeSkinId !== 'default' ? activeSkin.emoji[m] : undefined}
              />
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider leading-none">{t(`game_${m}`)}</span>
              {m === 'iron' && (
                <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 border border-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black font-mono shadow">
                  x{ironCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Full Screen Shop Overlay */}
      <StoreModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        virtualCash={virtualCash}
        ironCount={ironCount}
        ownedSkins={ownedSkins}
        activeSkinId={activeSkinId}
        onPurchaseSkin={handlePurchaseSkin}
        onPurchaseIron={handlePurchaseIron}
        onEquipSkin={handleEquipSkin}
      />
    </div>
  );
};

export default SinglePlayerGame;
