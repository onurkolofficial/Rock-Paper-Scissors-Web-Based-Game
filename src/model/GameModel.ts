export type Move = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'draw' | null;

export const MOVES: Move[] = ['rock', 'paper', 'scissors'];

export const determineWinner = (playerMove: Move, opponentMove: Move): Result => {
  if (playerMove === opponentMove) return 'draw';
  
  if (
    (playerMove === 'rock' && opponentMove === 'scissors') ||
    (playerMove === 'paper' && opponentMove === 'rock') ||
    (playerMove === 'scissors' && opponentMove === 'paper')
  ) {
    return 'win';
  }
  
  return 'lose';
};

export const getRandomMove = (): Move => {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
};
