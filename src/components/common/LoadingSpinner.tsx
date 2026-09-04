import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading collection...',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin`}
      />
      {label && (
        <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-light">
          {label}
        </span>
      )}
    </div>
  );
};
