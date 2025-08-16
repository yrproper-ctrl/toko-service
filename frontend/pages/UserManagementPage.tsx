import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import backend from '~backend/client';

interface User {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  photo: string | null;
  role: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface CurrentUser {
  id: number;
  name: string;
  role: string;
  email: string;
}

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    role: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setCurrentUser(parsedUser);

    // Check if user has permission
    if (parsedUser.role !== 'admin') {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengakses halaman ini",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [navigate, toast]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => await backend.auth.listUsers(),
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await backend.auth.createUser(data);
    },
    onSuccess: () => {
      toast({
        title: "User berhasil dibuat",
        description: "Akun user baru telah ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        role: '',
        email: '',
        password: '',
      });
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast({
        title: "Gagal membuat user",
        description: error.message || "Terjadi kesalahan saat membuat user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Nama, email, password, dan role harus diisi",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(formData);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'cs': return 'bg-blue-500';
      case 'teknisi': return 'bg-green-500';
      case 'kasir': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'cs': return 'Customer Service';
      case 'teknisi': return 'Teknisi';
      case 'kasir': return 'Kasir';
      default: return role;
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const users = usersData?.users || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Manajemen User
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah User Baru</DialogTitle>
                    <DialogDescription>
                      Buat akun user baru untuk sistem
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nama lengkap"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="cs">Customer Service</SelectItem>
                          <SelectItem value="teknisi">Teknisi</SelectItem>
                          <SelectItem value="kasir">Kasir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Alamat lengkap"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data user</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">No. Telepon</p>
                            <p className="font-medium">{user.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Dibuat</p>
                            <p className="font-medium">{new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        {user.address && (
                          <div className="mt-2">
                            <p className="text-gray-500 text-sm">Alamat</p>
                            <p className="text-sm">{user.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
