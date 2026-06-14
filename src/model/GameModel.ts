export type Move = 'rock' | 'paper' | 'scissors' | 'iron';
export type Result = 'win' | 'lose' | 'draw' | null;

export const MOVES: Move[] = ['rock', 'paper', 'scissors'];

export const determineWinner = (playerMove: Move, opponentMove: Move): Result => {
  if (playerMove === opponentMove) return 'draw';
  
  if (playerMove === 'iron') {
    if (opponentMove === 'rock' || opponentMove === 'scissors') {
      return 'win';
    }
    if (opponentMove === 'paper') {
      return 'lose';
    }
  }

  if (opponentMove === 'iron') {
    if (playerMove === 'rock' || playerMove === 'scissors') {
      return 'lose';
    }
    if (playerMove === 'paper') {
      return 'win';
    }
  }

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

