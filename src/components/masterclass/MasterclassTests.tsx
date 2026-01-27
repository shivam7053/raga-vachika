import React from 'react';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { Masterclass } from '@/types/masterclass';
import { LockedContent } from './LockedContent';

interface MasterclassTestsProps {
  masterclass: Masterclass;
  hasAccess: boolean;
  isMasterclassFree: boolean;
  onEnroll: () => void;
}

export const MasterclassTests: React.FC<MasterclassTestsProps> = ({
  masterclass,
  hasAccess,
  isMasterclassFree,
  onEnroll
}) => {
  if (!hasAccess) {
    return (
      <LockedContent 
        title="Tests are Locked" 
        message="Enroll in this masterclass to take tests and track your progress." 
        hasAccess={hasAccess}
        isMasterclassFree={isMasterclassFree}
        onEnroll={onEnroll}
      />
    );
  }

  if (masterclass.tests && masterclass.tests.length > 0) {
    return (
      <div className="space-y-3">
        {masterclass.tests.map(test => (
          <Link 
            href={`/testportal/${test.id}?masterclassId=${masterclass.id}`} 
            key={test.id} 
            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ClipboardCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{test.title}</p>
              {test.description && <p className="text-sm text-gray-500 dark:text-gray-400">{test.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return <p className="text-gray-500 text-center py-8">No tests available for this masterclass yet.</p>;
};
