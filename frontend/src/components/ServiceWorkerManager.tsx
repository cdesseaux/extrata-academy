'use client';

import { useEffect } from 'react';

export const ServiceWorkerManager = () => {
  useEffect(() => {
    // Desregistra todos os service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          console.log('Desregistrando service worker:', registration.scope);
          registration.unregister();
        });
      });

      // Limpa todos os caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            console.log('Limpando cache:', cacheName);
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return null;
};

