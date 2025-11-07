import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  reward_balance: number;
}

export interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (err) {
      console.error('Error fetching user achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUnlockAchievements = async () => {
    if (!user) return;

    try {
      // Get user stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed');

      const { data: reviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id);

      const ordersCount = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const reviewsCount = reviews?.length || 0;

      // Get unlocked achievement IDs
      const unlockedIds = userAchievements.map(ua => ua.achievement_id);

      // Check each achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'orders_count':
            shouldUnlock = ordersCount >= achievement.requirement_value;
            break;
          case 'total_spent':
            shouldUnlock = totalSpent >= achievement.requirement_value;
            break;
          case 'reviews_count':
            shouldUnlock = reviewsCount >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          await unlockAchievement(achievement);
        }
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!user) return;

    try {
      // Insert user achievement
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

      if (insertError) throw insertError;

      // Add reward balance
      if (achievement.reward_balance > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              balance: Number(profile.balance) + Number(achievement.reward_balance),
            })
            .eq('id', user.id);
        }
      }

      // Show notification
      toast.success(
        `🏆 Досягнення розблоковано: ${achievement.name}`,
        {
          description: `+${achievement.reward_balance}₴ на баланс`,
          duration: 5000,
        }
      );

      // Refresh user achievements
      await fetchUserAchievements();
    } catch (err) {
      console.error('Error unlocking achievement:', err);
    }
  };

  const getProgress = (achievement: Achievement) => {
    // This would need to calculate actual progress based on requirement_type
    // For now, return 0 if locked, 100 if unlocked
    const isUnlocked = userAchievements.some(ua => ua.achievement_id === achievement.id);
    return isUnlocked ? 100 : 0;
  };

  return {
    achievements,
    userAchievements,
    loading,
    checkAndUnlockAchievements,
    getProgress,
    refetch: fetchUserAchievements,
  };
};
