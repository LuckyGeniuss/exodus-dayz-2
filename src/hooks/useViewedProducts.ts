import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

const STORAGE_KEY = 'viewed-products';
const MAX_VIEWED = 10;

export const useViewedProducts = () => {
  const { user } = useAuth();
  const [viewedProductIds, setViewedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchViewedProducts();
    } else {
      loadFromLocalStorage();
    }
  }, [user]);

  const fetchViewedProducts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('viewed_products')
      .select('product_id')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(MAX_VIEWED);

    if (data) {
      setViewedProductIds(data.map(v => v.product_id));
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setViewedProductIds(JSON.parse(stored));
    }
  };

  const addViewedProduct = async (productId: string) => {
    if (user) {
      await supabase
        .from('viewed_products')
        .upsert({ 
          user_id: user.id, 
          product_id: productId,
          viewed_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,product_id' 
        });
      await fetchViewedProducts();
    } else {
      const updated = [productId, ...viewedProductIds.filter(id => id !== productId)].slice(0, MAX_VIEWED);
      setViewedProductIds(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return { viewedProductIds, addViewedProduct };
};
