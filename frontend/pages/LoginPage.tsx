import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, LogIn } from 'lucide-react';
import backend from '~backend/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await backend.auth.login(data);
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${data.user.name}!`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      toast({
        title: "Login gagal",
        description: "Email atau password salah",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email dan password harus diisi",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login Staff</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@techrepair.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Accounts:</p>
          <p>Admin: admin@techrepair.com / admin123</p>
          <p>CS: cs@techrepair.com / cs123</p>
          <p>Teknisi: teknisi@techrepair.com / teknisi123</p>
          <p>Kasir: kasir@techrepair.com / kasir123</p>
        </div>
      </div>
    </div>
  );
}
