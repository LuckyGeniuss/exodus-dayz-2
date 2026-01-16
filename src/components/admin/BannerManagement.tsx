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
import { Loader2, Plus, Pencil, Trash2, Image, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  badge_text: string | null;
  badge_color: string | null;
  background_gradient: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const BannerManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    link_text: 'Детальніше',
    badge_text: '',
    badge_color: 'primary',
    background_gradient: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: '',
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Banner[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('homepage_banners').insert(banner);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Банер створено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка створення банера: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...banner }: Partial<Banner> & { id: string }) => {
      const { error } = await supabase
        .from('homepage_banners')
        .update(banner)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Банер оновлено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка оновлення банера: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('homepage_banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Банер видалено');
    },
    onError: (error) => {
      toast.error('Помилка видалення банера: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url || null,
      link_url: formData.link_url || null,
      link_text: formData.link_text || 'Детальніше',
      badge_text: formData.badge_text || null,
      badge_color: formData.badge_color || 'primary',
      background_gradient: formData.background_gradient || null,
      is_active: formData.is_active,
      display_order: formData.display_order,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, ...bannerData });
    } else {
      createMutation.mutate(bannerData);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      link_text: banner.link_text || 'Детальніше',
      badge_text: banner.badge_text || '',
      badge_color: banner.badge_color || 'primary',
      background_gradient: banner.background_gradient || '',
      is_active: banner.is_active,
      display_order: banner.display_order || 0,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      link_text: 'Детальніше',
      badge_text: '',
      badge_color: 'primary',
      background_gradient: '',
      is_active: true,
      display_order: 0,
      start_date: '',
      end_date: '',
    });
  };

  const toggleActive = (banner: Banner) => {
    updateMutation.mutate({ id: banner.id, is_active: !banner.is_active });
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
              <Image className="h-5 w-5" />
              Управління Банерами
            </CardTitle>
            <CardDescription>Додавайте банери для головної сторінки</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Додати банер
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? 'Редагувати банер' : 'Новий банер'}
                  </DialogTitle>
                  <DialogDescription>
                    Заповніть інформацію про банер
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Заголовок *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Новий VIP статус"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="subtitle">Підзаголовок</Label>
                    <Textarea
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      rows={2}
                      placeholder="Отримайте ексклюзивні бонуси"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image_url">URL зображення</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="link_url">URL посилання</Label>
                      <Input
                        id="link_url"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        placeholder="/product/vip-gold"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="link_text">Текст кнопки</Label>
                      <Input
                        id="link_text"
                        value={formData.link_text}
                        onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                        placeholder="Детальніше"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="badge_text">Текст бейджа</Label>
                      <Input
                        id="badge_text"
                        value={formData.badge_text}
                        onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                        placeholder="Новинка"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="badge_color">Колір бейджа</Label>
                      <Input
                        id="badge_color"
                        value={formData.badge_color}
                        onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                        placeholder="primary, destructive, secondary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="background_gradient">Градієнт фону (CSS)</Label>
                    <Input
                      id="background_gradient"
                      value={formData.background_gradient}
                      onChange={(e) => setFormData({ ...formData, background_gradient: e.target.value })}
                      placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="display_order">Порядок</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="start_date">Дата початку</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_date">Дата закінчення</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                    {editingBanner ? 'Зберегти' : 'Створити'}
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
              <TableHead>Превью</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Дати</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners?.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{banner.subtitle}</p>
                    )}
                    {banner.badge_text && (
                      <Badge variant="secondary" className="mt-1">{banner.badge_text}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => toggleActive(banner)}
                  />
                </TableCell>
                <TableCell>{banner.display_order}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {banner.start_date && (
                      <p>Від: {format(new Date(banner.start_date), 'dd.MM.yy', { locale: uk })}</p>
                    )}
                    {banner.end_date && (
                      <p>До: {format(new Date(banner.end_date), 'dd.MM.yy', { locale: uk })}</p>
                    )}
                    {!banner.start_date && !banner.end_date && (
                      <span className="text-muted-foreground">Безстроково</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {banner.link_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(banner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Видалити цей банер?')) {
                        deleteMutation.mutate(banner.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {banners?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Банерів поки немає. Додайте перший банер!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BannerManagement;
