
import React, { useState } from 'react';
import { Level } from '../types';
import { LEVEL_CONFIGS } from '../constants';

interface StartScreenProps {
  onStart: (prompt: string, level: Level) => void;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.4s' }}></div>
    <span className="ml-2">Generating your masterpiece...</span>
  </div>
);

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading, error }) => {
  const [prompt, setPrompt] = useState<string>('A majestic lion in a vibrant jungle');
  const [selectedLevel, setSelectedLevel] = useState<Level>(Level.Easy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStart(prompt, selectedLevel);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl mx-auto text-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Create Your Puzzle</h2>
      <p className="text-gray-400 mb-6">Describe the image you want to turn into a jigsaw puzzle. The more creative, the better!</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
            rows={3}
            placeholder="e.g., A futuristic city on Mars"
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose Difficulty</h3>
          <div className="flex justify-center flex-wrap gap-2">
            {Object.values(Level).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSelectedLevel(level)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedLevel === level
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {level} ({LEVEL_CONFIGS[level].gridSize}x{LEVEL_CONFIGS[level].gridSize})
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Puzzle'}
        </button>
      </form>
      
      {error && <p className="text-red-400 mt-4 animate-shake">{error}</p>}
    </div>
  );
};
