import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { uk } from 'date-fns/locale';

interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  product_ids: string[];
  discount_percent: number;
  start_date: string;
  end_date: string;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

const FlashSaleManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    product_ids: '',
    discount_percent: 20,
    start_date: '',
    end_date: '',
    max_uses: '',
    is_active: true,
  });

  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FlashSale[];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (sale: Omit<FlashSale, 'id' | 'created_at' | 'current_uses'>) => {
      const { error } = await supabase.from('flash_sales').insert({
        ...sale,
        current_uses: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
      toast.success('Флеш-розпродаж створено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка створення: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...sale }: Partial<FlashSale> & { id: string }) => {
      const { error } = await supabase
        .from('flash_sales')
        .update(sale)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
      toast.success('Флеш-розпродаж оновлено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка оновлення: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('flash_sales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] });
      toast.success('Флеш-розпродаж видалено');
    },
    onError: (error) => {
      toast.error('Помилка видалення: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productIds = formData.product_ids
      .split(',')
      .map(id => id.trim())
      .filter(id => id);

    const saleData = {
      title: formData.title,
      description: formData.description || null,
      product_ids: productIds,
      discount_percent: formData.discount_percent,
      start_date: formData.start_date,
      end_date: formData.end_date,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: formData.is_active,
    };

    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, ...saleData });
    } else {
      createMutation.mutate(saleData);
    }
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setFormData({
      title: sale.title,
      description: sale.description || '',
      product_ids: sale.product_ids.join(', '),
      discount_percent: sale.discount_percent,
      start_date: sale.start_date.slice(0, 16),
      end_date: sale.end_date.slice(0, 16),
      max_uses: sale.max_uses?.toString() || '',
      is_active: sale.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSale(null);
    setFormData({
      title: '',
      description: '',
      product_ids: '',
      discount_percent: 20,
      start_date: '',
      end_date: '',
      max_uses: '',
      is_active: true,
    });
  };

  const getSaleStatus = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.start_date);
    const end = new Date(sale.end_date);

    if (!sale.is_active) return { status: 'inactive', label: 'Неактивний', color: 'outline' as const };
    if (now < start) return { status: 'scheduled', label: 'Заплановано', color: 'secondary' as const };
    if (now > end) return { status: 'ended', label: 'Завершено', color: 'outline' as const };
    return { status: 'active', label: 'Активний', color: 'destructive' as const };
  };

  const getTimeRemaining = (sale: FlashSale) => {
    const now = new Date();
    const end = new Date(sale.end_date);
    const start = new Date(sale.start_date);

    if (now < start) {
      const hours = differenceInHours(start, now);
      return `Старт через ${hours}г`;
    }
    if (now > end) return 'Завершено';

    const hours = differenceInHours(end, now);
    const minutes = differenceInMinutes(end, now) % 60;
    return `${hours}г ${minutes}хв`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Флеш-розпродажі
            </CardTitle>
            <CardDescription>Обмежені за часом акції та знижки</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Нова акція
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingSale ? 'Редагувати акцію' : 'Нова флеш-акція'}
                  </DialogTitle>
                  <DialogDescription>
                    Створіть обмежену за часом пропозицію
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Назва акції *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ніч знижок! -30% на всі VIP"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Опис</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Детальний опис акції"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product_ids">ID товарів (через кому)</Label>
                    <Textarea
                      id="product_ids"
                      value={formData.product_ids}
                      onChange={(e) => setFormData({ ...formData, product_ids: e.target.value })}
                      rows={2}
                      placeholder="vip-gold, vip-platinum, cassette-rock"
                    />
                    <p className="text-xs text-muted-foreground">
                      Доступні товари: {products?.map(p => p.id).join(', ')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discount_percent">Знижка (%)</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        min="1"
                        max="90"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_uses">Ліміт покупок</Label>
                      <Input
                        id="max_uses"
                        type="number"
                        min="1"
                        value={formData.max_uses}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                        placeholder="Без ліміту"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Початок *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">Закінчення *</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Активна</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Скасувати
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingSale ? 'Зберегти' : 'Створити'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Знижка</TableHead>
              <TableHead>Товарів</TableHead>
              <TableHead>Використань</TableHead>
              <TableHead>Час</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashSales?.map((sale) => {
              const { label, color } = getSaleStatus(sale);
              return (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.title}</p>
                      {sale.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {sale.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-lg">
                      -{sale.discount_percent}%
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.product_ids.length}</TableCell>
                  <TableCell>
                    {sale.current_uses} / {sale.max_uses || '∞'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(sale)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(sale.start_date), 'dd.MM HH:mm', { locale: uk })} - {format(new Date(sale.end_date), 'dd.MM HH:mm', { locale: uk })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={color}>{label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sale)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Видалити цю акцію?')) {
                          deleteMutation.mutate(sale.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {flashSales?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Флеш-акцій поки немає. Створіть першу акцію!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FlashSaleManagement;
