"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null); // Allow it to reappear if conditions change or user navigates
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg flex items-center justify-between gap-4 z-50 max-w-md w-[90%]">
      <div className="flex items-center gap-3">
        <span role="img" aria-label="Install icon" className="text-2xl">📱</span>
        <p className="text-sm font-medium">Install E-Guidance for a better experience!</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleInstallClick} className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-semibold">
          Install
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default PwaInstallPrompt;