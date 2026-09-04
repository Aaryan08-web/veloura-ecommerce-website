import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText = 'Explore Products',
  actionHref = '/shop',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-900 dark:text-white mb-6 shadow-sm dark:shadow-lg">
          {icon}
        </div>
      )}
      <h3 className="text-2xl sm:text-3xl font-serif text-stone-950 dark:text-white font-light mb-2.5">
        {title}
      </h3>
      {description && (
        <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 leading-relaxed font-light">
          {description}
        </p>
      )}
      {actionText && (
        <div>
          {actionHref ? (
            <Link to={actionHref}>
              <Button variant="primary" size="md">
                {actionText} →
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionText} →
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
