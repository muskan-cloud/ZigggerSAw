
export enum Level {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Expert = 'Expert',
  Master = 'Master',
}

export interface LevelConfig {
  gridSize: number;
  name: Level;
  hints: number;
}

export interface PuzzlePieceType {
  id: number;
  imgSrc: string;
}

export type GameState = 'start' | 'generating' | 'playing' | 'solved';

export interface DraggedPieceInfo {
  piece: PuzzlePieceType;
  sourceIndex: number;
  sourceContainer: 'bank' | 'grid';
}
