import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, List, Users, BarChart3, Wrench } from 'lucide-react';
import backend from '~backend/client';

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.role && parsedUser.email) {
        setUser(parsedUser);
      } else {
        console.error('Invalid user data:', parsedUser);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const { data: servicesData, isError: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await backend.service.listServices();
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const services = servicesData?.services || [];
  const stats = {
    total: services.length,
    terima: services.filter(s => s?.status === 'terima').length,
    proses: services.filter(s => s?.status === 'proses').length,
    selesai: services.filter(s => s?.status === 'selesai').length,
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

  const canAccess = (requiredRoles: string[]) => {
    return user && user.role && requiredRoles.includes(user.role);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TechRepair Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <Badge className={getRoleColor(user.role)}>
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Service</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diterima</CardTitle>
              <div className="h-4 w-4 bg-blue-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.terima}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
              <div className="h-4 w-4 bg-yellow-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.proses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.selesai}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canAccess(['admin', 'cs']) && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Service Baru
                </CardTitle>
                <CardDescription>
                  Tambah data service perbaikan baru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/service/new">
                  <Button className="w-full">
                    Buat Service Baru
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="mr-2 h-5 w-5" />
                Daftar Service
              </CardTitle>
              <CardDescription>
                Lihat dan kelola semua data service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/service/list">
                <Button variant="outline" className="w-full">
                  Lihat Daftar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {canAccess(['admin']) && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Manajemen User
                </CardTitle>
                <CardDescription>
                  Kelola akun staff dan pengguna
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/users">
                  <Button variant="outline" className="w-full">
                    Kelola User
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Terbaru</CardTitle>
              <CardDescription>
                5 service terakhir yang masuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicesError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading services. Please try refreshing the page.</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Belum ada data service</p>
                  </div>
                ) : (
                  services.slice(0, 5).map((service) => {
                    if (!service || !service.id) return null;
                    
                    return (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{service.serviceCode || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {service.customerName || 'N/A'} - {service.itemType || 'N/A'}
                          </p>
                        </div>
                        <Badge className={
                          service.status === 'terima' ? 'bg-blue-500' :
                          service.status === 'proses' ? 'bg-yellow-500' :
                          service.status === 'selesai' ? 'bg-green-500' :
                          service.status === 'batal' ? 'bg-red-500' : 'bg-gray-500'
                        }>
                          {service.status === 'terima' ? 'Diterima' :
                           service.status === 'proses' ? 'Proses' :
                           service.status === 'selesai' ? 'Selesai' :
                           service.status === 'batal' ? 'Batal' : 'Diambil'}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
