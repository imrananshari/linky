'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, ShieldCheck, Zap } from 'lucide-react';

export const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 right-4 w-[280px] z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-2xl group">
        <button 
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-sm overflow-hidden">
              <img src="/icon-192x192.png" alt="Linky App" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white dark:border-[#1A1A1A]">
              <ShieldCheck size={8} />
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
              Install Linky App
            </h4>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
              Fast & Secure Downloads
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex-shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-sm"
          >
            Get App
          </button>
        </div>
      </div>
    </div>
  );
};
