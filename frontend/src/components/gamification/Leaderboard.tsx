'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface UserXP {
  id: string;
  userId: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  user: User;
}

export default function Leaderboard() {
  const { isAuthenticated, getToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadLeaderboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadLeaderboard = async () => {
    try {
      const data = await apiClient.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 1: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 2: return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Ranking</h3>
      
      {leaderboard.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📊</div>
          <p>Nenhum dado de ranking disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((userXP, index) => (
            <div
              key={userXP.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getRankColor(index)}`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold">
                  {getRankIcon(index)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {userXP.user.firstName || userXP.user.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    Nível {userXP.level}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {userXP.totalXP} XP
                </div>
                <div className="text-sm text-gray-500">
                  {userXP.streak} dias
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
