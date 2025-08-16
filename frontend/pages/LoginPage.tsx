import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.role && parsedUser.email) {
          navigate('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking existing login:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [navigate]);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        return await backend.auth.login(data);
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      try {
        if (!data || !data.user || !data.token) {
          throw new Error('Invalid response data');
        }

        if (!data.user.id || !data.user.name || !data.user.role || !data.user.email) {
          throw new Error('Invalid user data');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${data.user.name}!`,
        });
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing login success:', error);
        toast({
          title: "Login gagal",
          description: "Terjadi kesalahan saat memproses login",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      let errorMessage = "Email atau password salah";
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        }
      }
      
      toast({
        title: "Login gagal",
        description: errorMessage,
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

    if (!email.includes('@')) {
      toast({
        title: "Error",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 3) {
      toast({
        title: "Error",
        description: "Password minimal 3 karakter",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ email: email.trim(), password: password.trim() });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const isSubmitting = isLoading || loginMutation.isPending;

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
                  onChange={handleEmailChange}
                  placeholder="admin@techrepair.com"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-medium mb-2">Demo Accounts:</p>
          <div className="space-y-1">
            <p>Admin: admin@techrepair.com / admin123</p>
            <p>CS: cs@techrepair.com / cs123</p>
            <p>Teknisi: teknisi@techrepair.com / teknisi123</p>
            <p>Kasir: kasir@techrepair.com / kasir123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
