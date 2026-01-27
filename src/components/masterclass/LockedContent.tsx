import React from 'react';
import { Lock, ShoppingCart } from 'lucide-react';

interface LockedContentProps {
  title: string;
  message: string;
  hasAccess: boolean;
  isMasterclassFree: boolean;
  onEnroll: () => void;
}

export const LockedContent: React.FC<LockedContentProps> = ({
  title,
  message,
  hasAccess,
  isMasterclassFree,
  onEnroll
}) => {
  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Lock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{message}</p>
      {!hasAccess && !isMasterclassFree && (
        <button
          onClick={onEnroll}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 mx-auto"
        >
          <ShoppingCart className="w-5 h-5" />
          Enroll to Unlock
        </button>
      )}
    </div>
  );
};
