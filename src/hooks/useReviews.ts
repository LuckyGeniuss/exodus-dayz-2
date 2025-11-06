import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar_url?: string;
}

export const useReviews = (productId?: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedReviews = (reviewsData || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        product_id: r.product_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        updated_at: r.updated_at,
        username: r.profiles?.username,
        avatar_url: r.profiles?.avatar_url,
      }));

      setReviews(transformedReviews);

      // Calculate average rating
      if (transformedReviews.length > 0) {
        const avg = transformedReviews.reduce((sum, r) => sum + r.rating, 0) / transformedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Не вдалося завантажити відгуки');
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (rating: number, comment: string) => {
    if (!user || !productId) {
      toast.error('Увійдіть, щоб залишити відгук');
      return false;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating,
          comment,
        });

      if (error) throw error;

      toast.success('Відгук додано');
      await fetchReviews();
      return true;
    } catch (err: any) {
      console.error('Error adding review:', err);
      toast.error(err.message || 'Не вдалося додати відгук');
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Відгук видалено');
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Не вдалося видалити відгук');
      return false;
    }
  };

  return {
    reviews,
    loading,
    averageRating,
    addReview,
    deleteReview,
    refetch: fetchReviews,
  };
};
