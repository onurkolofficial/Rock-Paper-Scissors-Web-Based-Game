import { Capacitor } from '@capacitor/core';
import { GameServices } from '@openforge/capacitor-game-services';

export const submitScoreToPlayGames = async (score: number) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await GameServices.submitScore({
        leaderboardId: 'CgkIua-BqqENEAIQAQ', // REPLACE WITH REAL LEADERBOARD ID
        score: score
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
  { id: 't1', playGamesId: 'CgkIua-BqqENEAIQBQ', titleKey: 'ach_t1_title', descKey: 'ach_t1_desc', icon: '🏆', isUnlocked: false },
  { id: 't2', playGamesId: 'CgkIua-BqqENEAIQBA', titleKey: 'ach_t2_title', descKey: 'ach_t2_desc', icon: '🔥', isUnlocked: false },
  { id: 't3', playGamesId: 'CgkIua-BqqENEAIQAw', titleKey: 'ach_t3_title', descKey: 'ach_t3_desc', icon: '⚡', isUnlocked: false },
  { id: 't4', playGamesId: 'CgkIua-BqqENEAIQCg', titleKey: 'ach_t4_title', descKey: 'ach_t4_desc', icon: '🤝', isUnlocked: false },
  { id: 't5', playGamesId: 'CgkIua-BqqENEAIQBg', titleKey: 'ach_t5_title', descKey: 'ach_t5_desc', icon: '🎯', isUnlocked: false },
  { id: 't6', playGamesId: 'CgkIua-BqqENEAIQAg', titleKey: 'ach_t6_title', descKey: 'ach_t6_desc', icon: '💰', isUnlocked: false },
  { id: 't7', playGamesId: 'CgkIua-BqqENEAIQBw', titleKey: 'ach_t7_title', descKey: 'ach_t7_desc', icon: '👥', isUnlocked: false },
  { id: 't8', playGamesId: 'CgkIua-BqqENEAIQCA', titleKey: 'ach_t8_title', descKey: 'ach_t8_desc', icon: '🛒', isUnlocked: false },
  { id: 't9', playGamesId: 'CgkIua-BqqENEAIQCQ', titleKey: 'ach_t9_title', descKey: 'ach_t9_desc', icon: '🎒', isUnlocked: false }
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

  // Trigger local notification callback
  if (onUnlock) {
    onUnlock({ ...ach, isUnlocked: true });
  }

  // Persist to Google Play Console natively if native
  if (Capacitor.isNativePlatform()) {
    try {
      await GameServices.unlockAchievement({
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
