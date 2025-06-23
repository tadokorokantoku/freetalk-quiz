import { useEffect, useState } from 'react';

interface WordProgressIndicatorProps {
  isActive: boolean;
  duration: number;
  onComplete?: () => void;
}

export default function WordProgressIndicator({ isActive, duration, onComplete }: WordProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}