import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, ShoppingCart, Package, DollarSign, Eye, Star, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { uk } from 'date-fns/locale';

const COLORS = ['hsl(18, 88%, 55%)', 'hsl(120, 15%, 35%)', 'hsl(38, 92%, 50%)', 'hsl(0, 70%, 50%)', 'hsl(200, 70%, 50%)'];

const AnalyticsDashboard = () => {
  // Fetch orders statistics
  const { data: ordersStats, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, final_amount, payment_status, created_at, payment_method')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch users statistics
  const { data: usersStats, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at, total_spent, is_veteran');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products statistics
  const { data: productsStats, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch product views
  const { data: viewsStats, isLoading: viewsLoading } = useQuery({
    queryKey: ['admin-views-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_views')
        .select('id, product_id, viewed_at')
        .gte('viewed_at', subDays(new Date(), 30).toISOString());
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch reviews
  const { data: reviewsStats, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-reviews-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, created_at');
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = ordersLoading || usersLoading || productsLoading || viewsLoading || reviewsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = ordersStats?.filter(o => o.payment_status === 'completed').reduce((sum, o) => sum + Number(o.final_amount), 0) || 0;
  const totalOrders = ordersStats?.length || 0;
  const completedOrders = ordersStats?.filter(o => o.payment_status === 'completed').length || 0;
  const pendingOrders = ordersStats?.filter(o => o.payment_status === 'pending').length || 0;
  const totalUsers = usersStats?.length || 0;
  const veteranUsers = usersStats?.filter(u => u.is_veteran).length || 0;
  const totalProducts = productsStats?.length || 0;
  const totalViews = viewsStats?.length || 0;
  const avgRating = reviewsStats?.length ? (reviewsStats.reduce((sum, r) => sum + r.rating, 0) / reviewsStats.length).toFixed(1) : '0';

  // Last 7 days revenue chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayOrders = ordersStats?.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= startOfDay(date) && orderDate <= endOfDay(date) && o.payment_status === 'completed';
    }) || [];
    return {
      date: format(date, 'dd.MM', { locale: uk }),
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.final_amount), 0),
      orders: dayOrders.length,
    };
  });

  // Category distribution
  const categoryData = productsStats?.reduce((acc, product) => {
    const category = product.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData || {}).map(([name, value]) => ({
    name: getCategoryLabel(name),
    value,
  }));

  // Payment methods distribution
  const paymentMethodData = ordersStats?.reduce((acc, order) => {
    const method = order.payment_method;
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentChartData = Object.entries(paymentMethodData || {}).map(([name, value]) => ({
    name: getPaymentMethodLabel(name),
    value,
  }));

  // Order status distribution
  const statusData = [
    { name: 'Завершено', value: completedOrders, fill: 'hsl(120, 50%, 45%)' },
    { name: 'Очікує', value: pendingOrders, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Скасовано', value: totalOrders - completedOrders - pendingOrders, fill: 'hsl(0, 70%, 50%)' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Загальний дохід"
          value={`${totalRevenue.toLocaleString()} ₴`}
          icon={DollarSign}
          description="Завершені замовлення"
          trend="+12.5%"
          trendUp
        />
        <MetricCard
          title="Замовлення"
          value={totalOrders.toString()}
          icon={ShoppingCart}
          description={`${completedOrders} завершено`}
        />
        <MetricCard
          title="Користувачі"
          value={totalUsers.toString()}
          icon={Users}
          description={`${veteranUsers} ветеранів`}
        />
        <MetricCard
          title="Товари"
          value={totalProducts.toString()}
          icon={Package}
          description={`${totalViews} переглядів`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Перегляди товарів"
          value={totalViews.toString()}
          icon={Eye}
          description="За останні 30 днів"
          small
        />
        <MetricCard
          title="Середній рейтинг"
          value={avgRating}
          icon={Star}
          description={`${reviewsStats?.length || 0} відгуків`}
          small
        />
        <MetricCard
          title="Конверсія"
          value={`${totalViews ? ((completedOrders / totalViews) * 100).toFixed(1) : 0}%`}
          icon={Percent}
          description="Замовлення / Перегляди"
          small
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Дохід за 7 днів
            </CardTitle>
            <CardDescription>Динаміка продажів</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(18, 88%, 55%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(18, 88%, 55%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 60%)" />
                  <YAxis stroke="hsl(0, 0%, 60%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 10%)',
                      border: '1px solid hsl(0, 0%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ₴`, 'Дохід']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(18, 88%, 55%)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders per day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Замовлення за 7 днів
            </CardTitle>
            <CardDescription>Кількість замовлень по днях</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis dataKey="date" stroke="hsl(0, 0%, 60%)" />
                  <YAxis stroke="hsl(0, 0%, 60%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 10%)',
                      border: '1px solid hsl(0, 0%, 20%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Замовлень']}
                  />
                  <Bar dataKey="orders" fill="hsl(120, 15%, 35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Категорії товарів</CardTitle>
            <CardDescription>Розподіл за категоріями</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Методи оплати</CardTitle>
            <CardDescription>Розподіл за способами оплати</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {paymentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Статус замовлень</CardTitle>
            <CardDescription>Розподіл за статусами</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Останні замовлення</CardTitle>
          <CardDescription>5 останніх замовлень</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordersStats?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: uk })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{Number(order.final_amount).toLocaleString()} ₴</p>
                  <p className={`text-sm ${
                    order.payment_status === 'completed' ? 'text-green-500' : 
                    order.payment_status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {getStatusLabel(order.payment_status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendUp?: boolean;
  small?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, description, trend, trendUp, small }: MetricCardProps) => (
  <Card className={small ? '' : 'bg-gradient-to-br from-card to-muted/30'}>
    <CardContent className={`${small ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mt-1`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`${small ? 'p-2' : 'p-3'} bg-primary/10 rounded-full`}>
          <Icon className={`${small ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
        </div>
      </div>
      {trend && (
        <div className={`mt-2 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trend} за місяць
        </div>
      )}
    </CardContent>
  </Card>
);

// Helper functions
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    vip: 'VIP',
    cosmetic: 'Косметика',
    vehicle: 'Транспорт',
    clothing: 'Одяг',
    cassette: 'Касети',
  };
  return labels[category] || category;
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    balance: 'Баланс',
    wayforpay: 'WayForPay',
    crypto: 'Крипто',
  };
  return labels[method] || method;
}

function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    completed: 'Завершено',
    pending: 'Очікує',
    failed: 'Скасовано',
  };
  return labels[status || ''] || status || '';
}

export default AnalyticsDashboard;
