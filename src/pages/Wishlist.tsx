import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { products } from '@/data/products';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (data && !error) {
      setCartItems(data.map(item => ({
        productId: item.product_id,
        quantity: item.quantity
      })));
    }
  };

  const addToCart = async (productId: string) => {
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      const newItems = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(newItems);

      if (user) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
    } else {
      const newItems = [...cartItems, { productId, quantity: 1 }];
      setCartItems(newItems);

      if (user) {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });
      } else {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
    }
    
    toast.success('Товар додано до кошика');
  };

  const wishlistProducts = products.filter(product => wishlist.includes(product.id));

  if (wishlistLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onCartOpen={() => {}} cartItemCount={0} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Завантаження...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onCartOpen={() => {}} 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            Збережені <span className="text-primary">товари</span>
          </h1>
          <p className="text-muted-foreground">
            {wishlistProducts.length > 0 
              ? `У вас ${wishlistProducts.length} збережен${wishlistProducts.length === 1 ? 'ий' : 'их'} товар${wishlistProducts.length === 1 ? '' : 'ів'}`
              : 'У вас поки немає збережених товарів'
            }
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground mb-4">
                Ви ще не зберегли жодного товару
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Натисніть на іконку серця на картці товару, щоб додати його до збережених
              </p>
              <Button onClick={() => navigate('/')}>
                Переглянути товари
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard 
                  product={product}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
