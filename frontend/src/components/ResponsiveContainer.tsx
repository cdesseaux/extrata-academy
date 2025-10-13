'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'px-2 sm:px-4';
      case 'md': return 'px-4 sm:px-6 lg:px-8';
      case 'lg': return 'px-6 sm:px-8 lg:px-12';
      default: return 'px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={`mx-auto ${getMaxWidthClass()} ${getPaddingClass()} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'md': return 'gap-4';
      case 'lg': return 'gap-6';
      default: return 'gap-4';
    }
  };

  const getGridColsClass = () => {
    const { default: defaultCols, sm, md, lg, xl } = cols;
    
    let gridClass = `grid-cols-${defaultCols}`;
    if (sm) gridClass += ` sm:grid-cols-${sm}`;
    if (md) gridClass += ` md:grid-cols-${md}`;
    if (lg) gridClass += ` lg:grid-cols-${lg}`;
    if (xl) gridClass += ` xl:grid-cols-${xl}`;
    
    return gridClass;
  };

  return (
    <div className={`grid ${getGridColsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  size?: {
    default: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function ResponsiveText({ 
  children, 
  size = { default: 'base' },
  weight = 'normal',
  className = ''
}: ResponsiveTextProps) {
  const getSizeClass = () => {
    const { default: defaultSize, sm, md, lg } = size;
    
    let sizeClass = `text-${defaultSize}`;
    if (sm) sizeClass += ` sm:text-${sm}`;
    if (md) sizeClass += ` md:text-${md}`;
    if (lg) sizeClass += ` lg:text-${lg}`;
    
    return sizeClass;
  };

  const getWeightClass = () => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
    }
  };

  return (
    <span className={`${getSizeClass()} ${getWeightClass()} ${className}`}>
      {children}
    </span>
  );
}

interface ResponsiveButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: {
    default: 'sm' | 'md' | 'lg';
    sm?: 'sm' | 'md' | 'lg';
    md?: 'sm' | 'md' | 'lg';
  };
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ResponsiveButton({ 
  children, 
  variant = 'primary',
  size = { default: 'md' },
  fullWidth = false,
  className = '',
  onClick,
  disabled = false
}: ResponsiveButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline': return 'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300';
      case 'ghost': return 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClass = () => {
    const { default: defaultSize, sm, md } = size;
    
    let sizeClass = '';
    switch (defaultSize) {
      case 'sm': sizeClass = 'px-3 py-1.5 text-sm'; break;
      case 'md': sizeClass = 'px-4 py-2 text-sm'; break;
      case 'lg': sizeClass = 'px-6 py-3 text-base'; break;
    }
    
    if (sm) {
      switch (sm) {
        case 'sm': sizeClass += ' sm:px-3 sm:py-1.5 sm:text-sm'; break;
        case 'md': sizeClass += ' sm:px-4 sm:py-2 sm:text-sm'; break;
        case 'lg': sizeClass += ' sm:px-6 sm:py-3 sm:text-base'; break;
      }
    }
    
    if (md) {
      switch (md) {
        case 'sm': sizeClass += ' md:px-3 md:py-1.5 md:text-sm'; break;
        case 'md': sizeClass += ' md:px-4 md:py-2 md:text-sm'; break;
        case 'lg': sizeClass += ' md:px-6 md:py-3 md:text-base'; break;
      }
    }
    
    return sizeClass;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClass()}
        ${getSizeClass()}
        ${fullWidth ? 'w-full' : ''}
        rounded-md font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}


