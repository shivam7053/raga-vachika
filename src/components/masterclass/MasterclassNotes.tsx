import React from 'react';
import { FileText } from 'lucide-react';
import { Masterclass } from '@/types/masterclass';
import { LockedContent } from './LockedContent';

interface MasterclassNotesProps {
  masterclass: Masterclass;
  hasAccess: boolean;
  isMasterclassFree: boolean;
  onEnroll: () => void;
}

export const MasterclassNotes: React.FC<MasterclassNotesProps> = ({
  masterclass,
  hasAccess,
  isMasterclassFree,
  onEnroll
}) => {
  if (!hasAccess) {
    return (
      <LockedContent 
        title="Notes are Locked" 
        message="Enroll in this masterclass to access all the notes." 
        hasAccess={hasAccess}
        isMasterclassFree={isMasterclassFree}
        onEnroll={onEnroll}
      />
    );
  }

  if (masterclass.notes && masterclass.notes.length > 0) {
    return (
      <div className="space-y-3">
        {masterclass.notes.map(note => (
          <a 
            href={note.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={note.id} 
            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FileText className="w-5 h-5 text-indigo-500" />
            <span className="font-medium text-gray-800 dark:text-gray-200">{note.title}</span>
          </a>
        ))}
      </div>
    );
  }

  return <p className="text-gray-500 text-center py-8">No notes available for this masterclass yet.</p>;
};
