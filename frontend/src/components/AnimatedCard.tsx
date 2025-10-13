'use client';

import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hover = true,
  delay = 0,
  direction = 'up'
}: AnimatedCardProps) {
  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)';
      case 'down': return 'translateY(-20px)';
      case 'left': return 'translateX(20px)';
      case 'right': return 'translateX(-20px)';
      default: return 'translateY(20px)';
    }
  };

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
        transform: hover ? 'translateY(0)' : getInitialTransform(),
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }
      }}
    >
      {children}
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 600,
  className = '' 
}: FadeInProps) {
  return (
    <div
      className={`opacity-0 ${className}`}
      style={{
        animation: `fadeIn ${duration}ms ease-out ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({ 
  children, 
  direction = 'left',
  delay = 0,
  duration = 600,
  className = '' 
}: SlideInProps) {
  const getTransform = () => {
    switch (direction) {
      case 'left': return 'translateX(-100%)';
      case 'right': return 'translateX(100%)';
      case 'up': return 'translateY(-100%)';
      case 'down': return 'translateY(100%)';
      default: return 'translateX(-100%)';
    }
  };

  return (
    <div
      className={`transform ${className}`}
      style={{
        transform: getTransform(),
        animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration}ms ease-out ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}

interface PulseProps {
  children: ReactNode;
  className?: string;
}

export function Pulse({ children, className = '' }: PulseProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}

interface BounceProps {
  children: ReactNode;
  className?: string;
}

export function Bounce({ children, className = '' }: BounceProps) {
  return (
    <div className={`animate-bounce ${className}`}>
      {children}
    </div>
  );
}

// Adicionar as animações CSS ao globals.css
export const animationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes rotateIn {
    from {
      transform: rotate(-180deg);
      opacity: 0;
    }
    to {
      transform: rotate(0deg);
      opacity: 1;
    }
  }
`;


