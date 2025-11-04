import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      refunded: 'outline',
    };
    
    const labels: Record<string, string> = {
      pending: 'В обробці',
      completed: 'Завершено',
      failed: 'Помилка',
      refunded: 'Повернуто',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-military mb-8 flex items-center gap-2">
        <Package className="h-8 w-8" />
        Мої замовлення
      </h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">У вас поки немає замовлень</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <Card 
              key={order.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      Замовлення #{order.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.payment_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Товари:</h4>
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Кількість: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">{(item.product_price * item.quantity).toFixed(2)} ₴</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Сума:</span>
                    <span>{order.total_amount} ₴</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Знижка:</span>
                      <span>-{order.discount_amount} ₴</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>До сплати:</span>
                    <span className="text-primary">{order.final_amount} ₴</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Спосіб оплати:</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                  {order.steam_id && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Steam ID:</span>
                      <span className="font-mono">{order.steam_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;