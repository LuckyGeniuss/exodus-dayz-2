import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Ticket, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  min_order_amount: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const PromoCodeManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    max_uses: '',
    min_order_amount: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  });

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['admin-promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (code: Omit<PromoCode, 'id' | 'created_at' | 'current_uses'>) => {
      const { error } = await supabase.from('promo_codes').insert({
        ...code,
        current_uses: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast.success('Промокод створено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка створення промокода: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...code }: Partial<PromoCode> & { id: string }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update(code)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast.success('Промокод оновлено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка оновлення промокода: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promo-codes'] });
      toast.success('Промокод видалено');
    },
    onError: (error) => {
      toast.error('Помилка видалення промокода: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeData = {
      code: formData.code.toUpperCase(),
      discount_percent: formData.discount_percent,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      min_order_amount: formData.min_order_amount,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
    };

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, ...codeData });
    } else {
      createMutation.mutate(codeData);
    }
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_percent: code.discount_percent,
      max_uses: code.max_uses?.toString() || '',
      min_order_amount: code.min_order_amount,
      valid_from: code.valid_from.split('T')[0],
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      is_active: code.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCode(null);
    setFormData({
      code: '',
      discount_percent: 10,
      max_uses: '',
      min_order_amount: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Код скопійовано');
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const isCodeExpired = (code: PromoCode) => {
    if (!code.valid_until) return false;
    return new Date(code.valid_until) < new Date();
  };

  const isCodeUsedUp = (code: PromoCode) => {
    if (!code.max_uses) return false;
    return code.current_uses >= code.max_uses;
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
              <Ticket className="h-5 w-5" />
              Промокоди
            </CardTitle>
            <CardDescription>Керуйте знижковими промокодами</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Новий промокод
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCode ? 'Редагувати промокод' : 'Новий промокод'}
                  </DialogTitle>
                  <DialogDescription>
                    Створіть знижковий код для клієнтів
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Код *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        placeholder="SUMMER2024"
                        className="uppercase"
                      />
                      <Button type="button" variant="outline" onClick={generateRandomCode}>
                        Згенерувати
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discount_percent">Знижка (%)</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_uses">Макс. використань</Label>
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

                  <div className="grid gap-2">
                    <Label htmlFor="min_order_amount">Мін. сума замовлення (₴)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      min="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valid_from">Дійсний з</Label>
                      <Input
                        id="valid_from"
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valid_until">Дійсний до</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Активний</Label>
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
                    {editingCode ? 'Зберегти' : 'Створити'}
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
              <TableHead>Код</TableHead>
              <TableHead>Знижка</TableHead>
              <TableHead>Використань</TableHead>
              <TableHead>Мін. сума</TableHead>
              <TableHead>Термін дії</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes?.map((code) => (
              <TableRow key={code.id} className={!code.is_active || isCodeExpired(code) || isCodeUsedUp(code) ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-primary">{code.code}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyCode(code.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    -{code.discount_percent}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {code.current_uses} / {code.max_uses || '∞'}
                </TableCell>
                <TableCell>
                  {code.min_order_amount > 0 ? `${code.min_order_amount} ₴` : '-'}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Від: {format(new Date(code.valid_from), 'dd.MM.yy', { locale: uk })}</p>
                    {code.valid_until && (
                      <p className={isCodeExpired(code) ? 'text-destructive' : 'text-muted-foreground'}>
                        До: {format(new Date(code.valid_until), 'dd.MM.yy', { locale: uk })}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {!code.is_active ? (
                    <Badge variant="outline">Неактивний</Badge>
                  ) : isCodeExpired(code) ? (
                    <Badge variant="destructive">Прострочено</Badge>
                  ) : isCodeUsedUp(code) ? (
                    <Badge variant="outline">Вичерпано</Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">Активний</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(code)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Видалити цей промокод?')) {
                        deleteMutation.mutate(code.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {promoCodes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Промокодів поки немає. Створіть перший промокод!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PromoCodeManagement;
