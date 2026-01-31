
import { Enemy, Difficulty } from '../types';

export enum DifficultyTier {
  EASY,
  NORMAL,
  HARD,
  ELITE
}

interface TierConfig {
  speedMod: number;
  maxEnemies: number;
}

const CONFIG: Record<DifficultyTier, TierConfig> = {
  [DifficultyTier.EASY]: {
    speedMod: 0.8,
    maxEnemies: 3
  },
  [DifficultyTier.NORMAL]: {
    speedMod: 1.0,
    maxEnemies: 5
  },
  [DifficultyTier.HARD]: {
    speedMod: 1.25,
    maxEnemies: 8
  },
  [DifficultyTier.ELITE]: {
    speedMod: 1.5,
    maxEnemies: 12
  }
};

export const getTierFromDifficulty = (diff: Difficulty): DifficultyTier => {
  switch (diff) {
    case Difficulty.EASY: return DifficultyTier.EASY;
    case Difficulty.MEDIUM: return DifficultyTier.NORMAL;
    case Difficulty.HARD: return DifficultyTier.HARD;
    case Difficulty.INSANE: return DifficultyTier.ELITE;
    default: return DifficultyTier.NORMAL;
  }
};

export const getMaxEnemies = (tier: DifficultyTier): number => {
  return CONFIG[tier].maxEnemies;
};

/**
 * Applies difficulty scaling to an enemy instance at spawn time.
 * Mutates the enemy object directly.
 * 
 * Note: Cooldowns are not scaled here to avoid leaking difficulty fields 
 * into the Enemy type or AI logic. Speed is scaled as it's a standard property.
 */
export const scaleEnemy = (enemy: Enemy, tier: DifficultyTier): void => {
  const config = CONFIG[tier];
  if (enemy.speed !== undefined) {
    enemy.speed *= config.speedMod;
  }
};
