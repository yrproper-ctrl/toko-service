import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, QrCode } from 'lucide-react';
import backend from '~backend/client';
import QRCodeGenerator from '../components/QRCodeGenerator';

export default function CheckStatusPage() {
  const [serviceCode, setServiceCode] = useState('');
  const [searchCode, setSearchCode] = useState('');

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', searchCode],
    queryFn: async () => {
      if (!searchCode) return null;
      return await backend.service.getService({ serviceCode: searchCode });
    },
    enabled: !!searchCode,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceCode.trim()) {
      setSearchCode(serviceCode.trim());
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cek Status Perbaikan</CardTitle>
            <CardDescription>
              Masukkan kode service untuk melihat status perbaikan perangkat Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceCode">Kode Service</Label>
                <Input
                  id="serviceCode"
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  placeholder="Contoh: SRV-20241201-001"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Mencari...' : 'Cek Status'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>Kode service tidak ditemukan. Pastikan kode yang Anda masukkan benar.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {service && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detail Service</CardTitle>
                <Badge className={getStatusColor(service.status)}>
                  {getStatusText(service.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kode Service</Label>
                  <p className="text-lg font-mono">{service.serviceCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal</Label>
                  <p>{new Date(service.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama Pelanggan</Label>
                  <p>{service.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Jenis Barang</Label>
                  <p>{service.itemType}</p>
                </div>
              </div>

              {service.damageReport && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Laporan Kerusakan</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{service.damageReport}</p>
                </div>
              )}

              {service.totalCost > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estimasi Biaya</Label>
                  <p className="text-lg font-semibold text-green-600">
                    Rp {service.totalCost.toLocaleString('id-ID')}
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    <p>Biaya Perbaikan: Rp {service.repairCost.toLocaleString('id-ID')}</p>
                    <p>Biaya Sparepart: Rp {service.partsCost.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )}

              {service.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{service.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-500">QR Code</Label>
                  <QrCode className="h-4 w-4 text-gray-500" />
                </div>
                <div className="mt-2 flex justify-center">
                  <QRCodeGenerator value={service.serviceCode} size={150} />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Scan QR code ini untuk akses cepat
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
