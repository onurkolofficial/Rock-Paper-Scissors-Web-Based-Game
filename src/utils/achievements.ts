import { Capacitor } from '@capacitor/core';
import { CapacitorGameConnect } from '@openforge/capacitor-game-connect';
import { PLAY_GAMES_CONFIG } from '../config/playGames';

export const submitScoreToPlayGames = async (score: number) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await CapacitorGameConnect.submitScore({
        leaderboardID: PLAY_GAMES_CONFIG.LEADERBOARD_ID, // REPLACE WITH REAL LEADERBOARD ID
        totalScoreAmount: score
      });
      console.log('Score submitted successfully to Play Games:', score);
    } catch (e) {
      console.error('Failed to submit score to Play Games:', e);
    }
  }
};

export interface Achievement {
  id: string;
  playGamesId: string;
  titleKey: string;
  descKey: string;
  icon: string;
  isUnlocked: boolean;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 't1', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t1, titleKey: 'ach_t1_title', descKey: 'ach_t1_desc', icon: '🏆', isUnlocked: false },
  { id: 't2', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t2, titleKey: 'ach_t2_title', descKey: 'ach_t2_desc', icon: '🔥', isUnlocked: false },
  { id: 't3', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t3, titleKey: 'ach_t3_title', descKey: 'ach_t3_desc', icon: '⚡', isUnlocked: false },
  { id: 't4', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t4, titleKey: 'ach_t4_title', descKey: 'ach_t4_desc', icon: '🤝', isUnlocked: false },
  { id: 't5', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t5, titleKey: 'ach_t5_title', descKey: 'ach_t5_desc', icon: '🎯', isUnlocked: false },
  { id: 't6', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t6, titleKey: 'ach_t6_title', descKey: 'ach_t6_desc', icon: '💰', isUnlocked: false },
  { id: 't7', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t7, titleKey: 'ach_t7_title', descKey: 'ach_t7_desc', icon: '👥', isUnlocked: false },
  { id: 't8', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t8, titleKey: 'ach_t8_title', descKey: 'ach_t8_desc', icon: '🛒', isUnlocked: false },
  { id: 't9', playGamesId: PLAY_GAMES_CONFIG.ACHIEVEMENTS.t9, titleKey: 'ach_t9_title', descKey: 'ach_t9_desc', icon: '🎒', isUnlocked: false }
];

/**
 * Checks if an achievement is unlocked in local storage.
 */
export const isAchievementUnlocked = (id: string): boolean => {
  return localStorage.getItem(`sps_ach_unlocked_${id}`) === 'true';
};

/**
 * Sets an achievement as unlocked, submits to Play Games, and triggers a callback
 */
export const unlockAchievement = async (
  id: string,
  onUnlock?: (ach: Achievement) => void
): Promise<boolean> => {
  if (isAchievementUnlocked(id)) {
    return false;
  }

  // Mark as unlocked locally
  localStorage.setItem(`sps_ach_unlocked_${id}`, 'true');

  const ach = ACHIEVEMENTS_LIST.find((a) => a.id === id);
  if (!ach) return false;

  // Trigger local notification callback only on non-native environments 
  // to prevent overlapping with Play Games native toasts/sounds
  if (!Capacitor.isNativePlatform() && onUnlock) {
    onUnlock({ ...ach, isUnlocked: true });
  }

  // Persist to Google Play Console natively if native
  if (Capacitor.isNativePlatform()) {
    try {
      await CapacitorGameConnect.unlockAchievement({
        achievementID: ach.playGamesId
      });
      console.log('Successfully completed and reported to Play Games:', ach.id);
    } catch (e) {
      console.error('Failed to submit achievement natively on Play Games:', e);
    }
  }

  return true;
};

/**
 * Evaluates Single Player gameplay parameters to unlock achievements
 */
export const checkSinglePlayerAchievements = async (
  streak: number,
  totalWins: number,
  totalDraws: number,
  onUnlock: (ach: Achievement) => void
) => {
  // t1: Win more than 5 games in a row (streak >= 6)
  if (streak > 5) {
    await unlockAchievement('t1', onUnlock);
  }

  // t2: Win 5 matches in a row (streak >= 5)
  if (streak >= 5) {
    await unlockAchievement('t2', onUnlock);
  }

  // t3: Win 3 matches in a row (streak >= 3)
  if (streak >= 3) {
    await unlockAchievement('t3', onUnlock);
  }

  // t4: Total 10 draws (draws >= 10)
  if (totalDraws >= 10) {
    await unlockAchievement('t4', onUnlock);
  }

  // t5: 500 Score (totalWins >= 5 since 1 win = 100 pts)
  if (totalWins >= 5) {
    await unlockAchievement('t5', onUnlock);
  }

  // t6: $1000 Cash (totalWins >= 10 since $100 cash per win)
  if (totalWins >= 10) {
    await unlockAchievement('t6', onUnlock);
  }
};

/**
 * Evaluates Two Player gameplay mod trigger
 */
export const checkTwoPlayerAchievements = async (
  onUnlock: (ach: Achievement) => void
) => {
  // t7: Entertainment - Play in 2-Player game mode.
  await unlockAchievement('t7', onUnlock);
};
