'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function ConnectionStatus() {
  const { isOnline, updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!isOnline) {
    return (
      <div className="fixed top-4 left-4 z-50 animate-slide-in-left">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Sem conexão</span>
        </div>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="fixed top-4 left-4 z-50 animate-slide-in-left">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Atualização disponível</span>
          <button
            onClick={updateServiceWorker}
            className="ml-2 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>
    );
  }

  return null;
}


