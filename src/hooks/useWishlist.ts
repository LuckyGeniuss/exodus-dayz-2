import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

const WISHLIST_STORAGE_KEY = 'exodus-wishlist';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load wishlist:', error);
        }
      }
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (data && !error) {
      setWishlist(data.map(item => item.product_id));
    }
    setLoading(false);
  };

  const toggleWishlist = async (productId: string) => {
    const isInWishlist = wishlist.includes(productId);

    if (user) {
      if (isInWishlist) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Видалено зі збережених');
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        
        setWishlist(prev => [...prev, productId]);
        toast.success('Додано до збережених');
      }
    } else {
      // Handle localStorage for non-authenticated users
      const newWishlist = isInWishlist
        ? wishlist.filter(id => id !== productId)
        : [...wishlist, productId];
      
      setWishlist(newWishlist);
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
      
      toast.success(isInWishlist ? 'Видалено зі збережених' : 'Додано до збережених');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    loading
  };
};
