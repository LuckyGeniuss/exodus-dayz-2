import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export const useLoyalty = () => {
  const { user } = useAuth();

  const calculateCashback = (amount: number): number => {
    // 5% cashback on all purchases
    return amount * 0.05;
  };

  const addCashback = async (orderId: string, amount: number) => {
    if (!user) return;

    try {
      const cashback = calculateCashback(amount);

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Update balance
      await supabase
        .from('profiles')
        .update({
          balance: Number(profile.balance) + cashback,
        })
        .eq('id', user.id);

      // Log transaction
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          type: 'cashback',
          amount: cashback,
          description: `Кешбек за замовлення`,
          status: 'completed',
        });

      toast.success(
        `🎁 Кешбек нараховано!`,
        {
          description: `+${cashback.toFixed(2)}₴ на ваш баланс`,
          duration: 4000,
        }
      );
    } catch (err) {
      console.error('Error adding cashback:', err);
    }
  };

  const getBalanceHistory = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching balance history:', err);
      return [];
    }
  };

  return {
    calculateCashback,
    addCashback,
    getBalanceHistory,
  };
};
