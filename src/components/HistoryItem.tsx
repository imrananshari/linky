import React from 'react';
import { DownloadHistory } from '@/types';
import { PlatformBadge } from './PlatformBadge';
import { RotateCcw, Image as ImageIcon, Trash2 } from 'lucide-react';

interface HistoryItemProps {
  item: DownloadHistory;
  onRedownload: (url: string) => void;
  onRemove: (url: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onRedownload, onRemove }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="flex items-center gap-4 p-4 h-[88px] bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md transition-all group overflow-hidden">
      <div className="w-20 aspect-video bg-gray-100 dark:bg-[#252525] rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
        {!imgError ? (
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={16} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
          {item.title}
        </h4>
        <div className="flex items-center gap-2">
          <PlatformBadge platform={item.platform} className="px-2 py-0.5 text-[10px]" />
          <span className="text-[10px] text-gray-400">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onRedownload(item.url)}
          className="p-2.5 bg-gray-50 dark:bg-[#252525] text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-all"
          title="Redownload"
        >
          <RotateCcw size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
        <button
          onClick={() => onRemove(item.url)}
          className="p-2.5 bg-gray-50 dark:bg-[#252525] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
          title="Remove from history"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
