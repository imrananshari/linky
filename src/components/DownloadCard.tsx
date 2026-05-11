import React, { useState } from 'react';
import { VideoInfo } from '@/types';
import { Download, ExternalLink, Clock, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface DownloadCardProps {
  info: VideoInfo;
  onDownload: (formatId: string) => void;
  onClose: () => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({ info, onDownload, onClose }) => {
  const [imgError, setImgError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(info.formats[0]?.formatId || '');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      const format = info.formats.find(f => f.formatId === selectedFormat);
      
      // On Vercel, we always use Direct Download because the Node environment
      // doesn't support the yt-dlp binary and has a 4.5MB payload limit.
      if (format) {
        window.open(format.url, '_blank');
        return;
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500 group">
      <button 
        onClick={onClose}
        className="absolute -top-3 -right-3 p-2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors z-10"
        title="Clear"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-shrink-0 w-full md:w-64 aspect-video bg-gray-100 dark:bg-[#252525] rounded-xl overflow-hidden shadow-md">
          {!imgError ? (
            <img 
              src={info.thumbnail} 
              alt={info.title} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon size={32} />
              <span className="text-[10px] font-medium">Thumbnail not available</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(info.duration)}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {info.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
              <ExternalLink size={14} />
              {new URL(info.url).hostname}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Quality
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white font-medium truncate"
              >
                {info.formats.map((format) => (
                  <option key={format.formatId} value={format.formatId} className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">
                    {format.quality} ({format.ext.toUpperCase()}) - {formatSize(format.filesize)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {isDownloading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-purple-500/80">
                    <span>Downloading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`relative w-full h-12 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                  isDownloading 
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/30'
                }`}
              >
                {isDownloading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} />
                    <span className="text-xs uppercase tracking-widest">{progress}%</span>
                    <div 
                      className="absolute inset-y-0 left-0 bg-purple-500/10 transition-all duration-300 -z-10" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                ) : (
                  <>
                    <Download size={16} />
                    <span className="text-sm">Save to Device</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
