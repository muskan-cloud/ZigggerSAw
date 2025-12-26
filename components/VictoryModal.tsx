
import React from 'react';

interface VictoryModalProps {
  onPlayAgain: () => void;
  score: number;
  elapsedTime: number;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const VictoryModal: React.FC<VictoryModalProps> = ({ onPlayAgain, score, elapsedTime }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center transform scale-95 animate-modal-pop w-full max-w-md">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
          Congratulations!
        </h2>
        <p className="text-gray-300 mb-6">You solved the puzzle!</p>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-400">Time:</span>
            <span className="text-xl font-bold text-white">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-400">Score:</span>
            <span className="text-xl font-bold text-white">{Math.round(score)}</span>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Play Again
        </button>
      </div>
      <style>{`
        @keyframes modal-pop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modal-pop {
          animation: modal-pop 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};
