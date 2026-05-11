'use client';

import { useState, useEffect } from 'react';
import { Download, Link as LinkIcon, AlertCircle, Loader2, History, Info, CheckCircle2, X, ClipboardPaste } from 'lucide-react';
import axios from 'axios';
import { VideoInfo, DownloadHistory } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { DownloadCard } from '@/components/DownloadCard';
import { HistoryItem } from '@/components/HistoryItem';
import { InstallBanner } from '@/components/InstallBanner';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VideoInfo[]>([]);
  const [history, setHistory] = useState<DownloadHistory[]>([]);

  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get('url');
    if (queryUrl) {
      setUrl(queryUrl);
      // Optional: automatically trigger fetch
      setTimeout(() => {
        const fetchBtn = document.getElementById('fetch-btn');
        fetchBtn?.click();
      }, 500);
    }
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('download_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (info: VideoInfo) => {
    const newItem: DownloadHistory = {
      url: info.url,
      title: info.title,
      platform: info.platform,
      timestamp: Date.now(),
      thumbnail: info.thumbnail,
    };

    const newHistory = [newItem, ...history.filter(h => h.url !== info.url)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('download_history', JSON.stringify(newHistory));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleFetchInfo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    const urls = url.split(/[\s,]+/).filter(u => u.trim());
    if (urls.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/download', { url: urls[0] });
      const data = response.data;
      
      const newResults: VideoInfo[] = [];
      const videosToAdd = Array.isArray(data) ? data : [data];

      for (const video of videosToAdd) {
        // Check if already in history
        if (history.some(h => h.url === video.url)) {
          continue; 
        }
        
        newResults.push(video);
        saveToHistory(video);
      }

      if (newResults.length === 0 && urls.length > 0) {
        setSuccess('All videos from this link are already in your history!');
      } else {
        setResults(prev => [...newResults, ...prev]);
        setUrl(''); // Clear input after success
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (info: VideoInfo, formatId: string) => {
    const streamUrl = `/api/stream?url=${encodeURIComponent(info.url)}&format=${formatId}&title=${encodeURIComponent(info.title)}`;
    window.location.href = streamUrl;
  };

  const handleRedownload = (historyUrl: string) => {
    setUrl(historyUrl);
    // Trigger fetch automatically
    setTimeout(() => {
      const fetchBtn = document.getElementById('fetch-btn');
      fetchBtn?.click();
    }, 100);
  };

  const handleRemoveFromHistory = (historyUrl: string) => {
    const newHistory = history.filter(h => h.url !== historyUrl);
    setHistory(newHistory);
    localStorage.setItem('download_history', JSON.stringify(newHistory));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('download_history');
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="w-full max-w-lg mx-auto relative overflow-hidden pt-12 pb-8 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-500/10 via-transparent to-transparent -z-10 blur-3xl opacity-50" />
        
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl shadow-lg shadow-purple-500/20 overflow-hidden">
              <img src="/icon-192x192.png" alt="Linky Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Linky
            </h1>
          </div>

          <p className="text-base text-gray-500 dark:text-gray-400">
            Paste your link below to download videos.
          </p>

          <form onSubmit={handleFetchInfo} className="relative group pt-2">
            <div className="absolute inset-0 bg-purple-500/10 blur-xl group-focus-within:bg-purple-500/20 transition-all rounded-full" />
            <div className="relative flex flex-col gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <textarea
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste links (one per line)..."
                  className="w-full h-24 pl-11 pr-11 pt-3 pb-3 rounded-xl bg-white dark:bg-[#1A1A1A] border-2 border-gray-100 dark:border-gray-800 focus:border-[#7C3AED] dark:focus:border-[#7C3AED] shadow-sm outline-none transition-all text-gray-900 dark:text-white resize-none"
                />
                <div className="absolute right-3 top-3 flex flex-col gap-2">
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl('')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="p-1 text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste size={18} />
                  </button>
                </div>
              </div>
              <button
                id="fetch-btn"
                type="submit"
                disabled={loading || !url}
                className="h-12 px-8 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Fetch Videos'}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <PlatformBadge platform="youtube" />
            <PlatformBadge platform="instagram" />
            <PlatformBadge platform="facebook" />
            <PlatformBadge platform="snapchat" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-lg mx-auto px-4 pb-12 space-y-8">
        {/* Success Alert (Already downloaded) */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Notice</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400/80">{success}</p>
            </div>
          </div>
        )}
        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-bold text-red-800 dark:text-red-400">Unable to process URL</h4>
              <p className="text-sm text-red-700 dark:text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <Download className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              Fetching video information...
            </p>
          </div>
        )}

        {/* Success State */}
        {results.length > 0 && !loading && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
              <h2 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest">
                Playlist Content ({results.length})
              </h2>
              {results.length > 1 && (
                <span className="text-[10px] text-purple-500 font-bold uppercase">
                  Download items below
                </span>
              )}
            </div>
            {results.map((result, idx) => (
              <DownloadCard 
                key={`${result.url}-${idx}`}
                info={result} 
                onDownload={(formatId) => handleDownload(result, formatId)} 
                onClose={() => setResults(prev => prev.filter(r => r.url !== result.url))}
              />
            ))}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <History size={18} />
                <h2 className="font-bold text-sm uppercase tracking-wider">Recent Downloads</h2>
              </div>
              <button
                onClick={handleClearAllHistory}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid gap-3">
              {history.map((item) => (
                <HistoryItem 
                  key={item.timestamp} 
                  item={item} 
                  onRedownload={handleRedownload} 
                  onRemove={handleRemoveFromHistory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State / Intro Info */}
        {results.length === 0 && !loading && !error && history.length === 0 && (
          <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl p-8 text-center space-y-4 border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-12 h-12 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Info className="text-gray-400" size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white">How it works</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copy the link of any public video or reel, paste it above, and hit download to see available qualities.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto py-12 border-t border-gray-100 dark:border-gray-800 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Developed by <a href="https://imrandev.in" className="font-semibold hover:text-purple-500 transition-colors">imrandev.in</a>
        </p>
        <p className="text-[10px] text-gray-500/50">
          © 2026 Linky Video Downloader. All rights reserved.
        </p>
      </footer>

      <InstallBanner />
    </main>
  );
}
