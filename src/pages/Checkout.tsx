import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard, Wallet } from 'lucide-react';
import { products } from '@/data/products';

const Checkout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'usdt' | 'balance'>('card');
  const [profile, setProfile] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchProfile();
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (data && !error) {
      setCartItems(data.map(item => ({ productId: item.product_id, quantity: item.quantity })));
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const discount = profile?.is_veteran ? total * 0.5 : 0;
  const finalTotal = total - discount;

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              product_id: item.productId,
              product_name: product?.name || '',
              product_price: product?.price || 0,
              quantity: item.quantity,
            };
          }),
          payment_method: paymentMethod,
          total_amount: total,
          discount_amount: discount,
          final_amount: finalTotal,
        },
      });

      if (error) throw error;

      // Clear cart after successful order
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      toast.success('Замовлення успішно створено!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Помилка при створенні замовлення');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">Ваш кошик порожній</p>
            <Button onClick={() => navigate('/')}>Повернутися до магазину</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-military mb-8">Оформлення замовлення</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Товари</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {product.name} × {item.quantity}
                    </span>
                    <span>{(product.price * item.quantity).toFixed(2)} ₴</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Спосіб оплати</CardTitle>
              <CardDescription>Виберіть зручний спосіб оплати</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Картка (UAH)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="usdt" id="usdt" />
                  <Label htmlFor="usdt" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" />
                    USDT (Crypto)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balance" id="balance" disabled={!profile || profile.balance < finalTotal} />
                  <Label htmlFor="balance" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" />
                    Баланс ({profile?.balance || 0} ₴)
                    {profile && profile.balance < finalTotal && (
                      <span className="text-xs text-muted-foreground">(Недостатньо коштів)</span>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Підсумок</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Сума:</span>
                  <span>{total.toFixed(2)} ₴</span>
                </div>
                {profile?.is_veteran && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-2">
                      Знижка ветерана АТО/ООС:
                      <Badge variant="secondary">-50%</Badge>
                    </span>
                    <span>-{discount.toFixed(2)} ₴</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>До сплати:</span>
                  <span>{finalTotal.toFixed(2)} ₴</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing ? 'Обробка...' : 'Оплатити'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
