import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Newspaper, Eye, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  image: string | null;
  category: string;
  is_published: boolean;
  is_pinned: boolean;
  author_id: string;
  published_at: string | null;
  created_at: string;
}

const NEWS_CATEGORIES = [
  { value: 'update', label: 'Оновлення' },
  { value: 'event', label: 'Подія' },
  { value: 'announcement', label: 'Анонс' },
  { value: 'guide', label: 'Гайд' },
  { value: 'promo', label: 'Акція' },
];

const NewsManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    image: '',
    category: 'update',
    is_published: false,
    is_pinned: false,
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsPost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (post: Omit<NewsPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>) => {
      const { error } = await supabase.from('news_posts').insert({
        ...post,
        published_at: post.is_published ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Статтю створено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка створення статті: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...post }: Partial<NewsPost> & { id: string }) => {
      const updateData: any = { ...post };
      if (post.is_published && !editingPost?.is_published) {
        updateData.published_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('news_posts')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Статтю оновлено');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Помилка оновлення статті: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Статтю видалено');
    },
    onError: (error) => {
      toast.error('Помилка видалення статті: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Необхідно авторизуватись');
      return;
    }

    const postData = {
      title: formData.title,
      content: formData.content,
      summary: formData.summary || null,
      image: formData.image || null,
      category: formData.category,
      is_published: formData.is_published,
      is_pinned: formData.is_pinned,
      author_id: user.id,
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      summary: post.summary || '',
      image: post.image || '',
      category: post.category,
      is_published: post.is_published,
      is_pinned: post.is_pinned,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      image: '',
      category: 'update',
      is_published: false,
      is_pinned: false,
    });
  };

  const togglePublished = (post: NewsPost) => {
    updateMutation.mutate({ 
      id: post.id, 
      is_published: !post.is_published,
    });
  };

  const togglePinned = (post: NewsPost) => {
    updateMutation.mutate({ id: post.id, is_pinned: !post.is_pinned });
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
              <Newspaper className="h-5 w-5" />
              Новини та Статті
            </CardTitle>
            <CardDescription>Керуйте новинами та контентом сайту</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Нова стаття
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPost ? 'Редагувати статтю' : 'Нова стаття'}
                  </DialogTitle>
                  <DialogDescription>
                    Створіть новину або статтю для сайту
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
                      placeholder="Великий осінній апдейт"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="summary">Короткий опис</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      rows={2}
                      placeholder="Коротко про що стаття (для списку)"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="content">Контент *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      required
                      placeholder="Повний текст статті... (підтримується Markdown)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Категорія</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть категорію" />
                        </SelectTrigger>
                        <SelectContent>
                          {NEWS_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">URL зображення</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                      <Label htmlFor="is_published">Опублікувати</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_pinned"
                        checked={formData.is_pinned}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                      />
                      <Label htmlFor="is_pinned">Закріпити</Label>
                    </div>
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
                    {editingPost ? 'Зберегти' : 'Створити'}
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
              <TableHead>Зображення</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      {post.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      <p className="font-medium">{post.title}</p>
                    </div>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground truncate max-w-[250px]">{post.summary}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {NEWS_CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={post.is_published}
                      onCheckedChange={() => togglePublished(post)}
                    />
                    <span className="text-sm">
                      {post.is_published ? 'Опубліковано' : 'Чернетка'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Створено: {format(new Date(post.created_at), 'dd.MM.yy', { locale: uk })}</p>
                    {post.published_at && (
                      <p className="text-muted-foreground">
                        Опубл: {format(new Date(post.published_at), 'dd.MM.yy', { locale: uk })}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePinned(post)}
                    title={post.is_pinned ? 'Відкріпити' : 'Закріпити'}
                  >
                    <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-primary' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Видалити цю статтю?')) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {posts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Статей поки немає. Створіть першу статтю!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default NewsManagement;
