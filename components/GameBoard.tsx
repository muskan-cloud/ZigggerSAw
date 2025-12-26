
import React, { useState } from 'react';
import { PuzzlePieceType, DraggedPieceInfo } from '../types';

interface GameBoardProps {
  gridState: (PuzzlePieceType | null)[];
  bankState: PuzzlePieceType[];
  onDrop: (draggedInfo: DraggedPieceInfo, targetIndex: number) => void;
  gridSize: number;
  puzzleImage: string | null;
  onReset: () => void;
  elapsedTime: number;
  hintsRemaining: number;
  onUseHint: () => void;
  hintedCellIndex: number | null;
}

const PuzzlePiece: React.FC<{
  piece: PuzzlePieceType;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, piece: PuzzlePieceType) => void;
}> = ({ piece, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, piece)}
    className="w-full h-full bg-cover bg-center cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-105"
    style={{ backgroundImage: `url(${piece.imgSrc})` }}
  />
);

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gridState, bankState, onDrop, gridSize, puzzleImage, onReset,
  elapsedTime, hintsRemaining, onUseHint, hintedCellIndex 
}) => {
  const [draggedPieceInfo, setDraggedPieceInfo] = useState<DraggedPieceInfo | null>(null);
  const [isHintVisible, setIsHintVisible] = useState(false);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    piece: PuzzlePieceType,
    sourceIndex: number,
    sourceContainer: 'bank' | 'grid'
  ) => {
    const info: DraggedPieceInfo = { piece, sourceIndex, sourceContainer };
    setDraggedPieceInfo(info);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(info)); // For firefox compatibility
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedPieceInfo(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedPieceInfo) {
      onDrop(draggedPieceInfo, targetIndex);
    }
  };

  const gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center animate-fade-in">
      {/* Puzzle Bank */}
      <div className="w-full lg:w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">Time: {formatTime(elapsedTime)}</div>
          <div className="text-lg font-semibold">Hints: {hintsRemaining}</div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-center">Pieces</h3>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 h-80 overflow-y-auto pr-2">
          {bankState.map((piece, index) => (
            <div
              key={`bank-${piece.id}`}
              className="aspect-square bg-gray-700 border-2 border-transparent rounded-md overflow-hidden"
              onDragEnd={handleDragEnd}
            >
              <PuzzlePiece
                piece={piece}
                onDragStart={(e, p) => handleDragStart(e, p, index, 'bank')}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <button
             onClick={onUseHint}
             disabled={hintsRemaining === 0}
             className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
           >
             Use Hint
           </button>
          <button
             onClick={() => setIsHintVisible(prev => !prev)}
             className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
             {isHintVisible ? 'Hide Full Image' : 'Show Full Image'}
          </button>
          <button
             onClick={onReset}
             className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
           >
             New Puzzle
           </button>
        </div>
      </div>

      {/* Puzzle Grid */}
      <div className="w-full lg:w-2/3 aspect-square relative">
        <div
          className="grid gap-1 bg-gray-900 p-1 rounded-lg shadow-2xl"
          style={{ gridTemplateColumns }}
        >
          {gridState.map((piece, index) => {
            const isHinted = hintedCellIndex === index;
            return (
              <div
                key={`grid-${index}`}
                className={`aspect-square bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-md overflow-hidden flex items-center justify-center transition-all duration-300
                  ${isHinted ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' : ''}`
                }
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {piece && (
                  <PuzzlePiece
                    piece={piece}
                    onDragStart={(e, p) => handleDragStart(e, p, index, 'grid')}
                  />
                )}
              </div>
            );
          })}
        </div>
        {isHintVisible && puzzleImage && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-2 rounded-lg pointer-events-none">
              <img src={puzzleImage} alt="Puzzle Hint" className="max-w-full max-h-full object-contain rounded-md opacity-75"/>
            </div>
        )}
      </div>
    </div>
  );
};
