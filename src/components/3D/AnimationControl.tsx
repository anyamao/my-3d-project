import React from "react";

interface AnimationControlsProps {
  onPlayToFrame50: () => void;
  onPlayFromFrame50ToEnd: () => void;
  canPlayToFrame50: boolean;
  canPlayFromFrame50ToEnd: boolean;
  currentFrame: number;
  isAnimationComplete: boolean;
  isAnimationPlaying: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  onPlayToFrame50,
  onPlayFromFrame50ToEnd,
  canPlayToFrame50,
  canPlayFromFrame50ToEnd,
  currentFrame,
  isAnimationComplete,
  isAnimationPlaying,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg min-w-[320px]">
        <div className="text-center mb-3 space-y-1">
          <div className="text-sm font-medium text-gray-700">
            Current Frame: <span className="font-bold">{currentFrame}</span>
          </div>
          {isAnimationPlaying && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">
                Animation Playing...
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onPlayToFrame50}
            disabled={!canPlayToFrame50}
            className={`px-6 py-3 rounded-md font-medium transition-all flex-1 ${
              canPlayToFrame50
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAnimationPlaying ? "Playing..." : "Play to Frame 50"}
          </button>
          <button
            onClick={onPlayFromFrame50ToEnd}
            disabled={!canPlayFromFrame50ToEnd}
            className={`px-6 py-3 rounded-md font-medium transition-all flex-1 ${
              canPlayFromFrame50ToEnd
                ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAnimationPlaying ? "Playing..." : "Play from 50 to End"}
          </button>
        </div>
        <div className="mt-3 text-center space-y-1">
          {isAnimationComplete && (
            <div className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Animation Complete</span>
            </div>
          )}
          {!canPlayToFrame50 &&
            !canPlayFromFrame50ToEnd &&
            isAnimationPlaying && (
              <div className="text-sm text-gray-600">
                Please wait for animation to finish...
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
