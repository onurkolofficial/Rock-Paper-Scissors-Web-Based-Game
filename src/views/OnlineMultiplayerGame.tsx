import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { Move, MOVES } from '../model/GameModel';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Wifi } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import AlertModal from '../components/AlertModal';

const MoveIcon = ({ move, className }: { move: Move, className?: string }) => {
  if (move === 'rock') return <img src="/gfx_stone.png" alt="Rock" className={className} />;
  if (move === 'paper') return <img src="/gfx_paper.png" alt="Paper" className={className} />;
  return <img src="/gfx_scissors.png" alt="Scissors" className={className} />;
};

const OnlineMultiplayerGame: React.FC = () => {
  const { t } = useTranslation();
  const { setConfirmExit, userName, navigate } = useAppNavigation();
  const { playSound, vibrate } = useSettings();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<'connecting' | 'waiting' | 'playing' | 'result' | 'game_over' | 'opponent_disconnected'>('connecting');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [rematchKey, setRematchKey] = useState(0);
  const [finalResult, setFinalResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  
  const [myMove, setMyMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [opponentName, setOpponentName] = useState<string>('Oyuncu');
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState({ me: 0, opponent: 0 });

  useEffect(() => {
    // Connect to Websocket
    // If running in Capacitor (Android) we need a remote server URL, otherwise fallback to current origin
    const socketUrl = import.meta.env.VITE_SERVER_URL || undefined;
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_matchmaking', { name: userName || 'Misafir' });
    });

    newSocket.on('waiting_for_opponent', (data: { roomId: string }) => {
      setMatchStatus('waiting');
      setRoomId(data.roomId);
    });

    newSocket.on('match_found', (data: { roomId: string, players: any[] }) => {
      setMatchStatus('playing');
      const opponent = data.players.find(p => p.id !== newSocket.id);
      if (opponent) {
        setOpponentName(opponent.name);
      }
      playSound('click');
      vibrate('normal');
    });

    newSocket.on('opponent_moved', () => {
      // we can show a visual indicator if needed
    });

    newSocket.on('round_result', (data) => {
      setResult(data.result);
      setOpponentMove(data.opponentMove as Move);
      setScore({ me: data.score, opponent: data.opponentScore });
      setMatchStatus('result');

      if (data.result === 'win') {
        playSound('win');
      } else if (data.result === 'lose') {
        playSound('win'); // using win sound as default generic for now, ideally lose sound
      } else {
        playSound('draw');
      }
      vibrate('normal');
    });

    newSocket.on('next_round', () => {
      setMatchStatus('playing');
      setMyMove(null);
      setOpponentMove(null);
      setResult(null);
    });

    newSocket.on('game_over', (data) => {
      setMatchStatus('game_over');
      setFinalResult(data.result);
    });

    newSocket.on('opponent_disconnected', () => {
      setMatchStatus('opponent_disconnected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [rematchKey, userName, playSound, vibrate, t]);

  const handleExitClick = () => {
    playSound('click');
    setConfirmExit(true);
  };

  const handleRematch = () => {
    playSound('click');
    setMatchStatus('connecting');
    setRoomId(null);
    setMyMove(null);
    setOpponentMove(null);
    setResult(null);
    setFinalResult(null);
    setScore({ me: 0, opponent: 0 });
    setRematchKey(prev => prev + 1);
  };

  const handleDirectExit = () => {
    playSound('click');
    navigate('menu');
  };

  const handleSelectMove = (m: Move) => {
    if (socket && matchStatus === 'playing' && !myMove && m !== 'iron') {
      playSound('click');
      setMyMove(m);
      vibrate();
      socket.emit('send_move', { move: m });
    }
  };

  // Do not allow iron in online purely for fair matching unless both have it
  // For simplicity we just use standard 3 moves online
  const ALLOWED_MOVES: Move[] = ['rock', 'paper', 'scissors'];

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
        
        {matchStatus === 'playing' || matchStatus === 'result' ? (
          <div className="flex items-center space-x-6 font-black text-white">
            <div className="flex items-center gap-2">
               <span className="rotate-180 text-white/80 text-2xl">{score.opponent}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-white/50 h-16 w-20 relative px-2">
               <span className="text-[10px] uppercase tracking-widest leading-none text-center text-blue-400 font-bold border border-blue-500/30 bg-blue-500/10 px-2 py-1 rounded-full">VS</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-white text-2xl">{score.me}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-blue-400">
             <Wifi className="w-6 h-6 animate-pulse" />
          </div>
        )}
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* TOP HALF - OPPONENT (Rotated 180) */}
      <div className="flex-1 bg-transparent relative rotate-180 flex flex-col p-6 pt-12 pb-6">
        <div className="flex-1 w-full flex items-center justify-center min-h-[120px]">
           {(matchStatus === 'result' && opponentMove) && (
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center p-4 sm:p-6 text-white/80 border-4 border-white/10">
                  <MoveIcon move={opponentMove} className="w-full h-full" />
                </div>
             </motion.div>
           )}
           {matchStatus === 'playing' && myMove && !result && (
              <div className="text-blue-400 font-bold uppercase tracking-widest text-sm text-center animate-pulse flex flex-col items-center">
               <Wifi className="w-8 h-8 mb-2" />
               <span className="rotate-180">{t('waiting_for_opponent')}</span>
             </div>
           )}
        </div>

        <div className="mt-auto relative z-10 w-full flex flex-col items-center">
          <p className="text-center font-bold text-white/40 mb-4 uppercase tracking-widest text-xs relative max-w-[200px] truncate">{matchStatus === 'connecting' || matchStatus === 'waiting' ? '...' : opponentName}</p>
          <div className="flex justify-between max-w-sm mx-auto w-full gap-4 relative">
             {/* Opponent moves are not interactive */}
             <div className="flex-1 aspect-square rounded-2xl bg-white/5 border border-white/5"></div>
             <div className="flex-1 aspect-square rounded-2xl bg-white/5 border border-white/5"></div>
             <div className="flex-1 aspect-square rounded-2xl bg-white/5 border border-white/5"></div>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF - PLAYER 1 */}
      <div className="flex-1 bg-transparent relative flex flex-col p-6 pt-12 pb-6">
        <div className="flex-1 w-full flex items-center justify-center min-h-[120px]">
           {(myMove) && (
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.15)] flex items-center justify-center p-4 sm:p-6 border-4 border-blue-500/20 text-white">
                  <MoveIcon move={myMove} className="w-full h-full" />
                </div>
             </motion.div>
           )}
           {matchStatus === 'connecting' && (
             <div className="text-white/50 font-bold tracking-widest uppercase text-sm text-center flex flex-col items-center justify-center h-full">
               <Wifi className="w-8 h-8 mb-4 animate-pulse text-blue-400" />
               {t('online_connecting')}
             </div>
           )}
           {matchStatus === 'waiting' && (
             <div className="text-white/50 font-bold tracking-widest uppercase text-sm text-center flex flex-col items-center justify-center h-full">
               <Wifi className="w-8 h-8 mb-4 animate-pulse text-yellow-400" />
               {t('online_waiting')}
             </div>
           )}
           {matchStatus === 'playing' && !myMove && (
             <div className="text-white/80 font-bold uppercase tracking-widest text-sm text-center">
               {t('tap_to_play')}
             </div>
           )}
        </div>

        <div className="mt-auto relative z-10 w-full flex flex-col items-center">
          <p className="text-center font-bold text-white/40 mb-4 uppercase tracking-widest text-xs relative max-w-[200px] truncate">{userName || t('guest')}</p>

          <div className="flex justify-between max-w-sm mx-auto w-full gap-4 relative">
          {ALLOWED_MOVES.map((m) => (
            <button
              key={`p1-${m}`}
              onClick={() => handleSelectMove(m)}
              onTouchStart={() => handleSelectMove(m)}
              disabled={!!myMove || matchStatus !== 'playing'}
              className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl transition-all active:scale-95
                ${(myMove || matchStatus !== 'playing') ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/30 border-b-4 border-black/50' 
                : 'bg-white/10 text-white hover:bg-white/20 border-b-4 border-black/50 active:border-b-0 active:translate-y-1'}
                ${myMove === m ? 'ring-2 ring-blue-500/50' : ''}`}
            >
              <MoveIcon move={m} className="w-8 h-8" />
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Matchmaking Overlay */}
      <AnimatePresence>
        {(matchStatus === 'connecting' || matchStatus === 'waiting') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-8 left-4">
              <button 
                onClick={handleExitClick}
                className="p-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-90 transition-all border border-red-900/30"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 mb-8 bg-blue-500/10 rounded-full flex items-center justify-center border-4 border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            >
              <Wifi className={`w-16 h-16 ${matchStatus === 'connecting' ? 'text-blue-400' : 'text-yellow-400'} animate-pulse`} />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-4 uppercase">
              {matchStatus === 'connecting' ? t('online_connecting') : t('online_waiting')}
            </h2>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 className={`h-full ${matchStatus === 'connecting' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, repeat: Infinity }}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Result Overlay */}
      <AnimatePresence>
        {matchStatus === 'result' && result && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-30"
          >
             <div className="bg-black/90 backdrop-blur-xl border-y border-white/10 text-white w-full py-6 font-display font-black text-2xl uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center gap-6">
               <span className="rotate-180 text-white/80">{result === 'draw' ? t('game_draw') : (result === 'lose' ? t('game_play_win_remote') || 'KAZANDI' : t('game_play_lose_remote') || 'KAYBETTİ')}</span>
               <div className="w-full h-px bg-white/10" />
               <span className="text-white">{result === 'draw' ? t('game_draw') : (result === 'win' ? t('game_win') : t('game_lose'))}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over / Opponent Disconnected Overlay */}
      <AnimatePresence>
        {(matchStatus === 'game_over' || matchStatus === 'opponent_disconnected') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="text-center w-full max-w-sm flex flex-col gap-8">
              {matchStatus === 'opponent_disconnected' ? (
                <>
                  <Wifi className="w-20 h-20 mx-auto text-red-500 mb-2 opacity-80" />
                  <h2 className="text-3xl font-black text-white uppercase tracking-widest leading-tight">{t('online_opponent_disconnect') || 'Oyuncu Ayrıldı'}</h2>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 mb-2">
                    <span className="text-4xl font-black text-white">
                      {finalResult === 'win' ? '🏆' : (finalResult === 'lose' ? '💀' : '🤝')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                      {finalResult === 'draw' ? t('game_draw') : (finalResult === 'win' ? t('game_win') : t('game_lose'))}
                    </h2>
                    <p className="text-white/50 text-sm tracking-widest uppercase">{t('online_match_finished') || 'Eşleşme Tamamlandı'}</p>
                  </div>
                </>
              )}
              
              <div className="flex flex-col gap-4 w-full mt-4">
                <button 
                  onClick={handleRematch}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95 bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-blue-400"
                >
                  {t('online_new_match') || 'Yeni Eşleşme'}
                </button>
                <button 
                  onClick={handleDirectExit}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95 bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                >
                  {t('exit') || 'Çıkış Yap'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OnlineMultiplayerGame;
