import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-[11px] px-3.5 py-1.5 rounded-sm gap-1.5',
    md: 'text-xs px-5 py-2.5 rounded-sm gap-2',
    lg: 'text-xs px-7 py-3.5 rounded-sm gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] font-bold shadow-md dark:shadow-lg tracking-[0.2em]',
    secondary: 'bg-stone-100 border border-stone-300 text-stone-900 hover:bg-stone-200 dark:bg-zinc-900 dark:border-white/10 dark:text-white dark:hover:bg-zinc-800 tracking-[0.2em]',
    outline: 'border border-stone-400 text-stone-900 hover:bg-stone-900 hover:text-white dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black tracking-[0.2em]',
    ghost: 'text-stone-600 hover:text-stone-950 hover:bg-stone-900/5 dark:text-stone-300 dark:hover:text-white dark:hover:bg-white/5 tracking-[0.2em]',
    gold: 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] font-bold tracking-[0.2em] shadow-md dark:shadow-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
