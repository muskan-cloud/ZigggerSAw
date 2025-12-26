
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameBoard } from './components/GameBoard';
import { VictoryModal } from './components/VictoryModal';
import { generatePuzzleImage } from './services/geminiService';
import { LEVEL_CONFIGS, PUZZLE_IMAGE_SIZE, SCORE_CONSTANTS } from './constants';
import { Level, type PuzzlePieceType, type GameState, type DraggedPieceInfo } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [level, setLevel] = useState<Level>(Level.Easy);
  const [error, setError] = useState<string | null>(null);

  const [puzzleImage, setPuzzleImage] = useState<string | null>(null);
  
  const [gridState, setGridState] = useState<(PuzzlePieceType | null)[]>([]);
  const [bankState, setBankState] = useState<PuzzlePieceType[]>([]);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  // FIX: Use `number` for timer ID in browser environments instead of `NodeJS.Timeout`.
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [hintedCellIndex, setHintedCellIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  
  const gridSize = useMemo(() => LEVEL_CONFIGS[level].gridSize, [level]);

  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      const intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      setTimerIntervalId(intervalId);
    } else if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }

    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [gameState, startTime]);


  const createPuzzlePieces = useCallback((imageBase64: string, currentGridSize: number): Promise<PuzzlePieceType[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const createdPieces: PuzzlePieceType[] = [];
        const pieceWidth = img.width / currentGridSize;
        const pieceHeight = img.height / currentGridSize;
        
        for (let y = 0; y < currentGridSize; y++) {
          for (let x = 0; x < currentGridSize; x++) {
            const canvas = document.createElement('canvas');
            canvas.width = pieceWidth;
            canvas.height = pieceHeight;
            const context = canvas.getContext('2d');
            if (!context) {
              return reject(new Error('Could not get canvas context'));
            }
            context.drawImage(
              img,
              x * pieceWidth,
              y * pieceHeight,
              pieceWidth,
              pieceHeight,
              0,
              0,
              pieceWidth,
              pieceHeight
            );
            
            const pieceId = y * currentGridSize + x;
            createdPieces.push({
              id: pieceId,
              imgSrc: canvas.toDataURL(),
            });
          }
        }
        resolve(createdPieces);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for puzzle creation.'));
      };
      img.src = imageBase64;
    });
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const handleStartGame = useCallback(async (prompt: string, selectedLevel: Level) => {
    setGameState('generating');
    setError(null);
    setLevel(selectedLevel);
    setElapsedTime(0);

    try {
      const imageBase64 = await generatePuzzleImage(`${prompt}, ${PUZZLE_IMAGE_SIZE}x${PUZZLE_IMAGE_SIZE} pixels`);
      setPuzzleImage(imageBase64);
      
      const newGridSize = LEVEL_CONFIGS[selectedLevel].gridSize;
      const allPieces = await createPuzzlePieces(imageBase64, newGridSize);
      
      setBankState(shuffleArray(allPieces));
      setGridState(Array(newGridSize * newGridSize).fill(null));
      setHintsRemaining(LEVEL_CONFIGS[selectedLevel].hints);
      setScore(newGridSize * newGridSize * SCORE_CONSTANTS.BASE_PIECE_SCORE);
      setStartTime(Date.now());
      setGameState('playing');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGameState('start');
    }
  }, [createPuzzlePieces]);

  const checkWinCondition = useCallback((currentGrid: (PuzzlePieceType | null)[]) => {
    const isWon = currentGrid.every((piece, index) => piece !== null && piece.id === index);
    if (isWon) {
      if (timerIntervalId) clearInterval(timerIntervalId);
      
      const timePenalty = Math.floor(elapsedTime / 1000) * SCORE_CONSTANTS.TIME_PENALTY_PER_SECOND;
      const hintsUsed = LEVEL_CONFIGS[level].hints - hintsRemaining;
      const hintPenalty = hintsUsed * SCORE_CONSTANTS.HINT_PENALTY;
      
      setScore(prevScore => Math.max(0, prevScore - timePenalty - hintPenalty));
      setGameState('solved');
    }
  }, [level, hintsRemaining, elapsedTime, timerIntervalId]);

  const handleDrop = useCallback((draggedInfo: DraggedPieceInfo, targetIndex: number) => {
    const { piece, sourceIndex, sourceContainer } = draggedInfo;
    
    if (targetIndex === -1) return;

    const newGridState = [...gridState];
    const newBankState = [...bankState];

    const targetPiece = newGridState[targetIndex];

    if (sourceContainer === 'bank') {
      newGridState[targetIndex] = piece;
      newBankState.splice(sourceIndex, 1);
      if (targetPiece) {
        newBankState.push(targetPiece);
      }
    } else {
      newGridState[targetIndex] = piece;
      newGridState[sourceIndex] = targetPiece;
    }

    setGridState(newGridState);
    setBankState(newBankState);
    checkWinCondition(newGridState);
  }, [gridState, bankState, checkWinCondition]);

  const handleUseHint = useCallback(() => {
    if (hintsRemaining > 0 && bankState.length > 0) {
      setHintsRemaining(prev => prev - 1);
      
      const misplacedPiece = bankState[Math.floor(Math.random() * bankState.length)];
      setHintedCellIndex(misplacedPiece.id);

      setTimeout(() => {
        setHintedCellIndex(null);
      }, 2000);
    }
  }, [hintsRemaining, bankState]);

  const handleResetGame = () => {
    setGameState('start');
    setPuzzleImage(null);
    setBankState([]);
    setGridState([]);
    setError(null);
    setElapsedTime(0);
    if(timerIntervalId) clearInterval(timerIntervalId);
    setStartTime(null);
    setHintsRemaining(0);
    setScore(0);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'playing':
      case 'solved':
        return (
          <GameBoard
            gridState={gridState}
            bankState={bankState}
            onDrop={handleDrop}
            gridSize={gridSize}
            puzzleImage={puzzleImage}
            onReset={handleResetGame}
            elapsedTime={elapsedTime}
            hintsRemaining={hintsRemaining}
            onUseHint={handleUseHint}
            hintedCellIndex={hintedCellIndex}
          />
        );
      case 'start':
      case 'generating':
      default:
        return (
          <StartScreen
            onStart={handleStartGame}
            isLoading={gameState === 'generating'}
            error={error}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Gemini Jigsaw
        </h1>
        <p className="text-gray-400 mt-2">Create and solve puzzles with the power of AI.</p>
      </header>
      <main className="w-full max-w-5xl">
        {renderContent()}
      </main>
      {gameState === 'solved' && <VictoryModal onPlayAgain={handleResetGame} score={score} elapsedTime={elapsedTime} />}
    </div>
  );
};

export default App;
