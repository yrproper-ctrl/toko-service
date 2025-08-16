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
import { ArrowLeft, Edit, Eye, QrCode } from 'lucide-react';
import backend from '~backend/client';
import QRCodeGenerator from '../components/QRCodeGenerator';

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Service {
  id: number;
  serviceCode: string;
  customerId: number | null;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  technicianId: number | null;
  itemType: string;
  completeness: string | null;
  serialNumber: string | null;
  notes: string | null;
  damageReport: string | null;
  repairCost: number;
  partsCost: number;
  totalCost: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ServiceListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editData, setEditData] = useState({
    technicianId: '',
    damageReport: '',
    repairCost: '',
    partsCost: '',
    status: '',
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
    setUser(JSON.parse(userData));
  }, [navigate]);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => await backend.service.listServices(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => await backend.auth.listUsers(),
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: { id: number; technicianId?: number; damageReport?: string; repairCost?: number; partsCost?: number; status?: string }) => {
      return await backend.service.updateService(data);
    },
    onSuccess: () => {
      toast({
        title: "Service berhasil diupdate",
        description: "Data service telah diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSelectedService(null);
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
      toast({
        title: "Gagal update service",
        description: "Terjadi kesalahan saat mengupdate service",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setEditData({
      technicianId: service.technicianId?.toString() || '',
      damageReport: service.damageReport || '',
      repairCost: service.repairCost.toString(),
      partsCost: service.partsCost.toString(),
      status: service.status,
    });
  };

  const handleUpdate = () => {
    if (!selectedService) return;

    const updateData: any = { id: selectedService.id };
    
    if (editData.technicianId) updateData.technicianId = parseInt(editData.technicianId);
    if (editData.damageReport) updateData.damageReport = editData.damageReport;
    if (editData.repairCost) updateData.repairCost = parseFloat(editData.repairCost);
    if (editData.partsCost) updateData.partsCost = parseFloat(editData.partsCost);
    if (editData.status) updateData.status = editData.status;

    updateServiceMutation.mutate(updateData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terima': return 'bg-blue-500';
      case 'proses': return 'bg-yellow-500';
      case 'selesai': return 'bg-green-500';
      case 'batal': return 'bg-red-500';
      case 'diambil': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'terima': return 'Diterima';
      case 'proses': return 'Dalam Proses';
      case 'selesai': return 'Selesai';
      case 'batal': return 'Dibatalkan';
      case 'diambil': return 'Sudah Diambil';
      default: return status;
    }
  };

  const canEdit = (service: Service) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'cs' && ['terima', 'proses'].includes(service.status)) return true;
    if (user.role === 'teknisi' && service.technicianId === user.id) return true;
    if (user.role === 'kasir' && service.status === 'selesai') return true;
    return false;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const services = servicesData?.services || [];
  const users = usersData?.users || [];
  const technicians = users.filter(u => u.role === 'teknisi');

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
            <CardTitle>Daftar Service</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data service</div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{service.serviceCode}</h3>
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusText(service.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Pelanggan</p>
                            <p className="font-medium">{service.customerName}</p>
                            {service.customerPhone && <p className="text-gray-600">{service.customerPhone}</p>}
                          </div>
                          <div>
                            <p className="text-gray-500">Jenis Barang</p>
                            <p className="font-medium">{service.itemType}</p>
                            <p className="text-gray-600">{new Date(service.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Biaya</p>
                            <p className="font-medium text-green-600">
                              Rp {service.totalCost.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detail Service - {service.serviceCode}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Nama Pelanggan</Label>
                                  <p>{service.customerName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">No. Telepon</Label>
                                  <p>{service.customerPhone || '-'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Jenis Barang</Label>
                                  <p>{service.itemType}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Serial Number</Label>
                                  <p>{service.serialNumber || '-'}</p>
                                </div>
                              </div>
                              {service.completeness && (
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Kelengkapan</Label>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{service.completeness}</p>
                                </div>
                              )}
                              {service.damageReport && (
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Laporan Kerusakan</Label>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{service.damageReport}</p>
                                </div>
                              )}
                              {service.notes && (
                                <div>
                                  <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{service.notes}</p>
                                </div>
                              )}
                              <div className="flex justify-center">
                                <div className="text-center">
                                  <QRCodeGenerator value={service.serviceCode} size={150} />
                                  <p className="text-xs text-gray-500 mt-2">QR Code Service</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {canEdit(service) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Service - {service.serviceCode}</DialogTitle>
                                <DialogDescription>
                                  Update informasi service perbaikan
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {(user.role === 'admin' || user.role === 'cs') && (
                                  <div className="space-y-2">
                                    <Label>Teknisi</Label>
                                    <Select value={editData.technicianId} onValueChange={(value) => setEditData(prev => ({ ...prev, technicianId: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih teknisi" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="">Belum ditentukan</SelectItem>
                                        {technicians.map((tech) => (
                                          <SelectItem key={tech.id} value={tech.id.toString()}>
                                            {tech.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>Laporan Kerusakan</Label>
                                  <Textarea
                                    value={editData.damageReport}
                                    onChange={(e) => setEditData(prev => ({ ...prev, damageReport: e.target.value }))}
                                    placeholder="Deskripsikan kerusakan yang ditemukan"
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Biaya Perbaikan</Label>
                                    <Input
                                      type="number"
                                      value={editData.repairCost}
                                      onChange={(e) => setEditData(prev => ({ ...prev, repairCost: e.target.value }))}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Biaya Sparepart</Label>
                                    <Input
                                      type="number"
                                      value={editData.partsCost}
                                      onChange={(e) => setEditData(prev => ({ ...prev, partsCost: e.target.value }))}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="terima">Diterima</SelectItem>
                                      <SelectItem value="proses">Dalam Proses</SelectItem>
                                      <SelectItem value="selesai">Selesai</SelectItem>
                                      <SelectItem value="batal">Dibatalkan</SelectItem>
                                      <SelectItem value="diambil">Sudah Diambil</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex gap-4">
                                  <Button 
                                    onClick={handleUpdate}
                                    disabled={updateServiceMutation.isPending}
                                    className="flex-1"
                                  >
                                    {updateServiceMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                  </Button>
                                  <Button variant="outline" onClick={() => setSelectedService(null)} className="flex-1">
                                    Batal
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
