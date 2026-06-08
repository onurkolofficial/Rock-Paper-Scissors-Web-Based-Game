import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Move, Result, determineWinner, MOVES } from '../model/GameModel';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Hand, HandMetal, Scissors } from 'lucide-react';

const MoveIcon = ({ move, className }: { move: Move, className?: string }) => {
  if (move === 'rock') return <HandMetal className className={className} />;
  if (move === 'paper') return <Hand className className={className} />;
  return <Scissors className className={className} />;
};

const TwoPlayerGame: React.FC = () => {
  const { t } = useTranslation();
  const { setConfirmExit } = useAppNavigation();
  const { vibrate, playSound } = useSettings();

  const [p1Move, setP1Move] = useState<Move | null>(null);
  const [p2Move, setP2Move] = useState<Move | null>(null);
  
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<Result>(null); // from p1 perspective
  
  const [score, setScore] = useState({ p1: 0, p2: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleExitClick = () => {
    playSound('click');
    setConfirmExit(true);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (p1Move && p2Move && !showResult) {
      // Both selected, show outcome
      const outcome = determineWinner(p1Move, p2Move);
      setResult(outcome);
      setShowResult(true);
      setTimeLeft(null);
      
      vibrate();
      
      if (outcome === 'win') {
        setScore(s => ({ ...s, p1: s.p1 + 1 }));
        playSound('win');
      } else if (outcome === 'lose') {
        setScore(s => ({ ...s, p2: s.p2 + 1 }));
        playSound('win');
      } else {
        setScore(s => ({ ...s, draws: s.draws + 1 }));
        playSound('draw');
      }

      // Reset for next round automatically
      setTimeout(() => {
        setP1Move(null);
        setP2Move(null);
        setShowResult(false);
        setResult(null);
      }, 2000);
    } else if ((p1Move || p2Move) && !showResult) {
      // One selected, other not
      if (timeLeft === null) {
        setTimeLeft(1);
      } else if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 500);
      } else if (timeLeft === 0) {
        // Timeout!
        const outcome = p1Move ? 'win' : 'lose'; // p1 wins if p1 moved
        setResult(outcome);
        
        if (outcome === 'win') {
          setScore(s => ({ ...s, p1: s.p1 + 1 }));
        } else {
          setScore(s => ({ ...s, p2: s.p2 + 1 }));
        }
        playSound('win');
        
        setShowResult(true);
        vibrate();

        setTimeout(() => {
          setP1Move(null);
          setP2Move(null);
          setTimeLeft(null);
          setShowResult(false);
          setResult(null);
        }, 2000);
      }
    } else {
      setTimeLeft(null);
    }

    return () => clearTimeout(timer);
  }, [p1Move, p2Move, timeLeft, showResult, vibrate, playSound]);

  const handleP1Select = (m: Move) => {
    if (!p1Move && !showResult) {
      playSound('click');
      setP1Move(m);
      vibrate();
    }
  };

  const handleP2Select = (m: Move) => {
    if (!p2Move && !showResult) {
      playSound('click');
      setP2Move(m);
      vibrate();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full font-sans overflow-hidden relative bg-transparent">
      
      {/* Central Divider / Controls */}
      <div className="absolute top-1/2 left-0 right-0 h-16 -mt-8 z-20 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md border-y border-white/5 shadow-2xl">
        <button 
          onClick={handleExitClick}
          className="p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-90 transition-all border border-red-900/30"
        >
          <LogOut className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-6 font-black text-white">
          <div className="flex items-center gap-2">
             <span className="rotate-180 text-white/80 text-2xl">{score.p2}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-white/50 h-16 w-20 relative">
             <span className="text-[8px] uppercase tracking-widest rotate-180 absolute top-1">{t('game_draws')}</span>
             <span className="text-xl leading-none z-10 font-black">{score.draws}</span>
             <span className="text-[8px] uppercase tracking-widest absolute bottom-1">{t('game_draws')}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-white text-2xl">{score.p1}</span>
          </div>
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* TOP HALF - PLAYER 2 (Rotated 180) */}
      <div className="flex-1 bg-transparent relative rotate-180 flex flex-col justify-end p-6 pb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-10">
           {showResult && p2Move && (
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white/5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center p-6 text-white/80 border-4 border-white/10">
                  <MoveIcon move={p2Move} className="w-full h-full" />
                </div>
             </motion.div>
           )}
           {!showResult && p2Move && (
             <div className="text-white/60 font-bold uppercase tracking-widest text-sm">
               {t('waiting_for_opponent')}
             </div>
           )}
        </div>

        <div className="flex justify-between max-w-sm mx-auto w-full gap-4 relative z-10">
          {MOVES.map((m) => (
            <button
              key={`p2-${m}`}
              onClick={() => handleP2Select(m)}
              disabled={!!p2Move || showResult}
              className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all active:scale-95
                ${p2Move ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30 border-b-4 border-black/50' 
                : 'bg-white/10 text-white hover:bg-white/20 border-b-4 border-black/50 active:border-b-0 active:translate-y-1'}`}
            >
              <MoveIcon move={m} className="w-8 h-8" />
            </button>
          ))}
        </div>
        <p className="text-center font-bold text-white/40 mt-6 uppercase tracking-widest text-xs relative z-10">{t('game_player_2')}</p>
      </div>

      {/* BOTTOM HALF - PLAYER 1 */}
      <div className="flex-1 bg-transparent relative flex flex-col justify-end p-6 pb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-10">
           {showResult && p1Move && (
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white/10 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center p-6 border-4 border-white/20 text-white">
                  <MoveIcon move={p1Move} className="w-full h-full" />
                </div>
             </motion.div>
           )}
           {!showResult && p1Move && (
             <div className="text-white/80 font-bold uppercase tracking-widest text-sm">
               {t('waiting_for_opponent')}
             </div>
           )}
        </div>

        <p className="text-center font-bold text-white/40 mb-6 uppercase tracking-widest text-xs relative z-10">{t('game_player_1')}</p>
        <div className="flex justify-between max-w-sm mx-auto w-full gap-4 relative z-10">
          {MOVES.map((m) => (
            <button
              key={`p1-${m}`}
              onClick={() => handleP1Select(m)}
              disabled={!!p1Move || showResult}
              className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all active:scale-95
                ${p1Move ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30 border-b-4 border-black/50' 
                : 'bg-white/10 text-white hover:bg-white/20 border-b-4 border-black/50 active:border-b-0 active:translate-y-1'}`}
            >
              <MoveIcon move={m} className="w-8 h-8" />
            </button>
          ))}
        </div>
      </div>

      {/* Central Result Overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-30"
          >
             <div className="bg-black/90 backdrop-blur-xl border-y border-white/10 text-white w-full py-6 font-display font-black text-2xl uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center gap-6">
               <span className="rotate-180 text-white/80">{result === 'draw' ? t('game_draw') : (result === 'win' ? t('game_player_1_wins') : t('game_player_2_wins'))}</span>
               <div className="w-full h-px bg-white/10" />
               <span className="text-white">{result === 'draw' ? t('game_draw') : (result === 'win' ? t('game_player_1_wins') : t('game_player_2_wins'))}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TwoPlayerGame;
