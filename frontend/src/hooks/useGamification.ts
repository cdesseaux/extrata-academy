'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/KeycloakProvider';
import { apiClient } from '@/lib/api';

interface XPNotification {
  id: string;
  message: string;
  type: 'xp' | 'achievement' | 'levelup';
  amount?: number;
}

export function useGamification() {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const addXP = useCallback(async (
    amount: number,
    description: string,
    metadata?: any
  ) => {
    try {
      const result = await apiClient.request('/gamification/add-xp', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          type: 'lesson_completed',
          description,
          metadata,
        }),
      });
      
      // Adicionar notificação de XP
      const notification: XPNotification = {
        id: Date.now().toString(),
        message: description,
        type: 'xp',
        amount,
      };
      setNotifications(prev => [...prev, notification]);

      // Se subiu de nível, adicionar notificação de level up
      if (result.levelUp) {
        const levelUpNotification: XPNotification = {
          id: (Date.now() + 1).toString(),
          message: `Parabéns! Você subiu para o nível ${result.newLevel}!`,
          type: 'levelup',
        };
        setNotifications(prev => [...prev, levelUpNotification]);
      }

      return result;
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
    }
  }, []);

  const updateStreak = useCallback(async () => {
    try {
      await apiClient.request('/gamification/update-streak', {
        method: 'POST',
      });

      // Adicionar notificação de streak
      const notification: XPNotification = {
        id: Date.now().toString(),
        message: 'Sequência de dias mantida! 🔥',
        type: 'xp',
        amount: 10,
      };
      setNotifications(prev => [...prev, notification]);
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addXP,
    updateStreak,
    removeNotification,
  };
}
