import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Move, Result, determineWinner, getRandomMove, MOVES } from '../model/GameModel';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Hand, HandMetal, Scissors } from 'lucide-react';

const MoveIcon = ({ move, className }: { move: Move, className?: string }) => {
  if (move === 'rock') return <HandMetal className={className} />;
  if (move === 'paper') return <Hand className={className} />;
  return <Scissors className={className} />;
};

const SinglePlayerGame: React.FC = () => {
  const { t } = useTranslation();
  const { setConfirmExit, userName } = useAppNavigation();
  const { vibrate, playSound } = useSettings();

  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [computerMove, setComputerMove] = useState<Move | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ player: 0, computer: 0, draws: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const handleExitClick = () => {
    playSound('click');
    setConfirmExit(true);
  };

  const handlePlay = (move: Move) => {
    if (isPlaying) return;
    
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
      
      if (matchResult === 'win') {
        setScore(s => ({ ...s, player: s.player + 1 }));
        localStorage.setItem('sps_stats_wins', String(Number(localStorage.getItem('sps_stats_wins') || 0) + 1));
        playSound('win');
        vibrate(); // Vibrate again on win
      } else if (matchResult === 'lose') {
        setScore(s => ({ ...s, computer: s.computer + 1 }));
        localStorage.setItem('sps_stats_losses', String(Number(localStorage.getItem('sps_stats_losses') || 0) + 1));
        playSound('lose');
      } else {
        setScore(s => ({ ...s, draws: s.draws + 1 }));
        localStorage.setItem('sps_stats_draws', String(Number(localStorage.getItem('sps_stats_draws') || 0) + 1));
        playSound('draw');
      }
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    }, 800);
  };

  const getResultText = () => {
    if (result === 'win') return t('game_win');
    if (result === 'lose') return t('game_lose');
    if (result === 'draw') return t('game_draw');
    return '';
  };

  const getResultColor = () => {
    if (result === 'win') return 'text-green-400';
    if (result === 'lose') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full font-sans text-slate-100 overflow-hidden relative bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/5 absolute top-0 w-full z-10">
        <button 
          onClick={handleExitClick}
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/5 transition"
        >
          <ArrowLeft className="w-6 h-6 text-white/80" />
        </button>
        <div className="flex items-center space-x-6 text-lg font-bold">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/50">{t('game_wins')}</span>
            <span className="text-white">{score.player}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-white/50">{t('game_draws')}</span>
            <span className="text-white/60">{score.draws}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest text-white/50">{t('game_losses')}</span>
            <span className="text-white/80">{score.computer}</span>
          </div>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Battle Arena */}
      <div className="flex-1 flex flex-col items-center justify-center relative mt-16 pb-32">
        {/* Computer Side */}
        <div className="flex-1 flex items-center justify-center w-full relative">
          <AnimatePresence mode="popLayout">
            {computerMove ? (
              <motion.div
                key="computer-move"
                initial={{ scale: 0, y: -50, rotate: 180 }}
                animate={{ scale: 1, y: 0, rotate: 180 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-32 h-32 bg-white/5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center p-6 border-4 border-white/10 text-white/80"
              >
                <MoveIcon move={computerMove} className="w-full h-full" />
              </motion.div>
            ) : (
              <motion.div
                key="computer-waiting"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-32 h-32 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center text-white/20 rotate-180"
              >
                <span className="text-sm font-bold tracking-widest uppercase">?</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Center */}
        <div className="h-20 flex items-center justify-center w-full z-10">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={`text-3xl font-display font-black uppercase tracking-widest filter drop-shadow-lg text-white`}
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
                className="w-32 h-32 bg-white/10 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center p-6 border-4 border-white/20 text-white"
              >
                <MoveIcon move={playerMove} className="w-full h-full" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Container */}
      <div className="absolute bottom-0 w-full p-6 pb-8 bg-black/40 backdrop-blur-xl border-t border-white/5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between max-w-sm mx-auto">
          {MOVES.map((m) => (
            <button
              key={m}
              onClick={() => handlePlay(m)}
              disabled={isPlaying}
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all active:scale-95
                ${isPlaying ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30' 
                : 'bg-white/10 hover:bg-white/20 text-white border-b-4 border-black/50 active:border-b-0 active:translate-y-1'}`}
            >
              <MoveIcon move={m} className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t(`game_${m}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SinglePlayerGame;
