import React from 'react';
import { Lock, Clock, Calendar } from 'lucide-react';
import { Masterclass, MasterclassContent, YoutubeContent } from '@/types/masterclass';
import { getYouTubeVideoId, formatMasterclassDate } from '@/utils/masterclass';
import ZoomPanel from '@/components/ZoomPanel';
import { LockedContent } from './LockedContent';

interface MasterclassPlayerProps {
  selectedContent: MasterclassContent | null;
  setSelectedContent: (content: MasterclassContent) => void;
  showAllContent: boolean;
  masterclass: Masterclass;
  hasAccess: boolean;
  isMasterclassFree: boolean;
  processing: boolean;
  onEnroll: () => void;
}

export const MasterclassPlayer: React.FC<MasterclassPlayerProps> = ({
  selectedContent,
  setSelectedContent,
  showAllContent,
  masterclass,
  hasAccess,
  isMasterclassFree,
  processing,
  onEnroll,
}) => {
  const videoId = selectedContent?.source === "youtube" && selectedContent.youtube_url 
    ? getYouTubeVideoId(selectedContent.youtube_url) 
    : null;

  if (showAllContent) {
    return (
      <div className="space-y-6">
        {masterclass.content.map((contentItem, index) => {
          const isActive = selectedContent?.id === contentItem.id;
          const contentVideoId = contentItem.source === "youtube" && contentItem.youtube_url
            ? getYouTubeVideoId(contentItem.youtube_url)
            : null;

          return (
            <div
              key={contentItem.id}
              onClick={() => setSelectedContent(contentItem)}
              className={`rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all 
              ${isActive ? "ring-2 ring-indigo-500 bg-white dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}
            >
              {contentItem.source === "youtube" && (
                <div className="relative aspect-video bg-gray-900">
                  {hasAccess && contentVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${contentVideoId}`}
                      title={contentItem.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <LockedContent
                        title="Content Locked"
                        message={isMasterclassFree ? "Loading..." : "Purchase to unlock this video"}
                        hasAccess={hasAccess}
                        isMasterclassFree={isMasterclassFree}
                        onEnroll={onEnroll}
                      />
                    </div>
                  )}
                </div>
              )}

              {contentItem.source === "zoom" && (
                <ZoomPanel
                  content={contentItem}
                  hasAccess={hasAccess}
                  processing={processing}
                />
              )}

              <div className={`p-6 ${isActive ? "bg-indigo-50 dark:bg-indigo-900" : ""}`}>
                <h3 className="text-xl font-bold mb-2">
                  {index + 1}. {contentItem.title}
                </h3>
                {contentItem.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {contentItem.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  {contentItem.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {contentItem.duration}
                    </div>
                  )}
                  {contentItem.source === 'youtube' && (contentItem as YoutubeContent).scheduled_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatMasterclassDate((contentItem as YoutubeContent).scheduled_date!)} {(contentItem as YoutubeContent).scheduled_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {selectedContent?.source === "zoom" && (
        <ZoomPanel
          content={selectedContent}
          hasAccess={hasAccess}
          processing={processing}
        />
      )}
      {selectedContent?.source === "youtube" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            {(hasAccess || isMasterclassFree) && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={selectedContent.title}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <LockedContent
                  title="Content Locked"
                  message={isMasterclassFree ? "Select a video" : "Purchase to unlock this content"}
                  hasAccess={hasAccess}
                  isMasterclassFree={isMasterclassFree}
                  onEnroll={onEnroll}
                />
              </div>
            )}
          </div>

          {selectedContent && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedContent.title}</h2>
              {selectedContent.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedContent.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {selectedContent.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedContent.duration}
                  </div>
                )}
                {selectedContent.source === 'youtube' && (selectedContent as YoutubeContent).scheduled_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatMasterclassDate((selectedContent as YoutubeContent).scheduled_date!)} {(selectedContent as YoutubeContent).scheduled_time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
