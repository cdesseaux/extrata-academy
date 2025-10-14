'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  xpReward: number;
  isActive: boolean;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  isNotified: boolean;
  achievement: Achievement;
}

export default function AchievementsDisplay() {
  const { isAuthenticated, getToken } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadAchievements = async () => {
    try {
      const data = await apiClient.getUserAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Erro ao carregar achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Conquistas</h3>
      
      {achievements.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>Nenhuma conquista desbloqueada ainda.</p>
          <p className="text-sm">Continue aprendendo para desbloquear conquistas!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((userAchievement) => (
            <div
              key={userAchievement.id}
              className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
            >
              <div className="flex items-start space-x-3">
                <div className="text-3xl">{userAchievement.achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {userAchievement.achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {userAchievement.achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Desbloqueado em {new Date(userAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-sm font-medium text-orange-600">
                      +{userAchievement.achievement.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
