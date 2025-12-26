
import { Level, type LevelConfig } from './types';

export const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  [Level.Easy]: { gridSize: 3, name: Level.Easy, hints: 5 },
  [Level.Medium]: { gridSize: 4, name: Level.Medium, hints: 4 },
  [Level.Hard]: { gridSize: 5, name: Level.Hard, hints: 3 },
  [Level.Expert]: { gridSize: 6, name: Level.Expert, hints: 2 },
  [Level.Master]: { gridSize: 8, name: Level.Master, hints: 1 },
};

export const PUZZLE_IMAGE_SIZE = 512;

export const SCORE_CONSTANTS = {
  BASE_PIECE_SCORE: 100,
  TIME_PENALTY_PER_SECOND: 2,
  HINT_PENALTY: 500,
};
