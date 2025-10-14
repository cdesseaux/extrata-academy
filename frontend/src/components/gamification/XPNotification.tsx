'use client';

import { useEffect, useState } from 'react';

interface XPNotificationProps {
  message: string;
  type: 'xp' | 'achievement' | 'levelup';
  amount?: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function XPNotification({ 
  message, 
  type, 
  amount, 
  isVisible, 
  onClose 
}: XPNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'xp': return '⭐';
      case 'achievement': return '🏆';
      case 'levelup': return '🎉';
      default: return '⭐';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'xp': return 'bg-blue-500';
      case 'achievement': return 'bg-yellow-500';
      case 'levelup': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80`}>
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="font-semibold">{message}</div>
          {amount && (
            <div className="text-sm opacity-90">+{amount} XP</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}









