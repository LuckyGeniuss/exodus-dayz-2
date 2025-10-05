import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  steam_id: string | null;
  balance: number;
  is_veteran: boolean;
  created_at: string;
}

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    balance: '',
    is_veteran: false,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, balance, is_veteran }: { userId: string; balance: number; is_veteran: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ balance, is_veteran })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Профіль оновлено');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Помилка оновлення профілю: ' + error.message);
    },
  });

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      balance: user.balance.toString(),
      is_veteran: user.is_veteran,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateMutation.mutate({
      userId: editingUser.id,
      balance: parseFloat(formData.balance),
      is_veteran: formData.is_veteran,
    });
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
        <CardTitle>Управління Користувачами</CardTitle>
        <CardDescription>Редагування балансу та статусу ветерана</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Користувач</TableHead>
              <TableHead>Steam ID</TableHead>
              <TableHead>Баланс</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell className="font-mono text-sm">{user.steam_id || 'N/A'}</TableCell>
                <TableCell>{user.balance.toFixed(2)} ₴</TableCell>
                <TableCell>
                  {user.is_veteran && (
                    <Badge variant="secondary">Ветеран АТО/ООС</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Редагувати користувача</DialogTitle>
                          <DialogDescription>
                            {user.username}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="balance">Баланс (₴)</Label>
                            <Input
                              id="balance"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.balance}
                              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                              required
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="veteran">Ветеран АТО/ООС</Label>
                            <Switch
                              id="veteran"
                              checked={formData.is_veteran}
                              onCheckedChange={(checked) => setFormData({ ...formData, is_veteran: checked })}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Скасувати
                          </Button>
                          <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Зберегти
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
