'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export function NetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
      toast.success('Connection restored. You are back online.', {
        duration: 4000,
        icon: '✓',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      toast.error('No internet connection. Please check your network.', {
        duration: 0, // Persistent until dismissed
        icon: '✕',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 flex items-center justify-between animate-in slide-in-from-top">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <p className="text-sm font-medium">
          Please check connection. Mattermost unreachable. If issue persists, ask administrator to check WebSocket port.
        </p>
      </div>
      <button
        onClick={() => setShowBanner(false)}
        className="ml-4 p-1 hover:bg-red-600 rounded transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
