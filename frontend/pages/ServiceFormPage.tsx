import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import backend from '~backend/client';

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export default function ServiceFormPage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    itemType: '',
    completeness: '',
    serialNumber: '',
    notes: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check if user has permission
    if (!['admin', 'cs'].includes(parsedUser.role)) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengakses halaman ini",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [navigate, toast]);

  const createServiceMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await backend.service.createService(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Service berhasil dibuat",
        description: `Kode service: ${data.serviceCode}`,
      });
      navigate('/service/list');
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
      toast({
        title: "Gagal membuat service",
        description: "Terjadi kesalahan saat membuat service",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.itemType) {
      toast({
        title: "Error",
        description: "Nama pelanggan dan jenis barang harus diisi",
        variant: "destructive",
      });
      return;
    }
    createServiceMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
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
            <CardTitle>Tambah Service Baru</CardTitle>
            <CardDescription>
              Isi form di bawah untuk membuat service perbaikan baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nama Pelanggan *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Masukkan nama pelanggan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">No. Telepon</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Alamat</Label>
                <Textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  placeholder="Alamat lengkap pelanggan"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemType">Jenis Barang *</Label>
                  <Input
                    id="itemType"
                    value={formData.itemType}
                    onChange={(e) => handleInputChange('itemType', e.target.value)}
                    placeholder="Laptop, PC, Printer, dll"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Serial number perangkat"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="completeness">Kelengkapan</Label>
                <Textarea
                  id="completeness"
                  value={formData.completeness}
                  onChange={(e) => handleInputChange('completeness', e.target.value)}
                  placeholder="Charger, tas, mouse, dll"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Keluhan atau catatan tambahan"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createServiceMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createServiceMutation.isPending ? 'Menyimpan...' : 'Simpan Service'}
                </Button>
                <Link to="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
