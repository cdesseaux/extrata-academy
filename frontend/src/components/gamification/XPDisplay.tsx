'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';

interface UserXP {
  id: string;
  userId: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  lastActivityDate: string;
}

export default function XPDisplay() {
  const { isAuthenticated, getToken } = useAuth();
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserXP();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadUserXP = async () => {
    try {
      const data = await apiClient.getUserXP();
      setUserXP(data);
    } catch (error) {
      console.error('Erro ao carregar XP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!userXP) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-center text-gray-500">
          Carregando dados de XP...
        </div>
      </div>
    );
  }

  const progressPercentage = (userXP.currentLevelXP / userXP.nextLevelXP) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🎮 Gamificação</h3>
        <div className="text-sm text-gray-500">
          Nível {userXP.level}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{userXP.currentLevelXP} XP</span>
          <span>{userXP.nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-1">
          {userXP.nextLevelXP - userXP.currentLevelXP} XP para o próximo nível
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{userXP.totalXP}</div>
          <div className="text-sm text-gray-500">Total XP</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{userXP.streak}</div>
          <div className="text-sm text-gray-500">Sequência (dias)</div>
        </div>
      </div>
    </div>
  );
}
