import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, LogIn, Wrench } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Wrench className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">TechRepair Pro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistem Manajemen Perbaikan Komputer dan Perangkat Elektronik
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Search className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Cek Status Perbaikan</CardTitle>
              <CardDescription className="text-lg">
                Pantau perkembangan perbaikan perangkat Anda dengan memasukkan kode service
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/check-status">
                <Button size="lg" className="w-full">
                  <Search className="mr-2 h-5 w-5" />
                  Cek Status
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <LogIn className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Login Staff</CardTitle>
              <CardDescription className="text-lg">
                Akses sistem untuk mengelola data perbaikan dan pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Layanan Kami</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>Perbaikan Laptop</div>
              <div>Perbaikan PC</div>
              <div>Upgrade Hardware</div>
              <div>Instalasi Software</div>
              <div>Recovery Data</div>
              <div>Cleaning Service</div>
              <div>Maintenance</div>
              <div>Konsultasi IT</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
