import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

interface OrderWithProfile extends Order {
  username: string;
}

const OrderManagement = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch profiles for all users
      const userIds = [...new Set(ordersData.map(o => o.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data
      const profilesMap = new Map(profilesData.map(p => [p.id, p.username]));
      
      return ordersData.map(order => ({
        ...order,
        username: profilesMap.get(order.user_id) || 'N/A'
      })) as OrderWithProfile[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Завершено</Badge>;
      case 'pending':
        return <Badge variant="secondary">Очікує</Badge>;
      case 'failed':
        return <Badge variant="destructive">Помилка</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Картка';
      case 'usdt':
        return 'USDT';
      case 'balance':
        return 'Баланс';
      default:
        return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управління Замовленнями</CardTitle>
        <CardDescription>Перегляд всіх замовлень користувачів</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Користувач</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Знижка</TableHead>
              <TableHead>Підсумок</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: uk })}
                </TableCell>
                <TableCell>{order.username}</TableCell>
                <TableCell>{order.total_amount.toFixed(2)} ₴</TableCell>
                <TableCell>
                  {order.discount_amount > 0 ? (
                    <span className="text-green-600">-{order.discount_amount.toFixed(2)} ₴</span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="font-semibold">{order.final_amount.toFixed(2)} ₴</TableCell>
                <TableCell>{getPaymentMethodLabel(order.payment_method)}</TableCell>
                <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
