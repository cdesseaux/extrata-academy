'use client';

import { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = ''
}: LoadingSpinnerProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      case 'xl': return 'h-16 w-16';
      default: return 'h-8 w-8';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'border-blue-600';
      case 'secondary': return 'border-gray-600';
      case 'white': return 'border-white';
      case 'gray': return 'border-gray-400';
      default: return 'border-blue-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 ${getColorClass()} ${getSizeClass()}`}
        style={{
          borderTopColor: 'transparent',
        }}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  children?: ReactNode;
}

export function LoadingOverlay({ isVisible, text, children }: LoadingOverlayProps) {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
}

export function LoadingPage({ text = 'Carregando...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Carregando...',
  className = '',
  disabled = false,
  onClick
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}


