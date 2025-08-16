import { useState, useEffect, useCallback } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Safe localStorage access
  const safeLocalStorage = {
    getItem: (key: string) => {
      try {
        return localStorage?.getItem(key) || null;
      } catch (error) {
        console.warn('localStorage access failed:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage?.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage write failed:', error);
        return false;
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage?.removeItem(key);
        return true;
      } catch (error) {
        console.warn('localStorage remove failed:', error);
        return false;
      }
    }
  };

  // Safe JSON parsing
  const safeJsonParse = useCallback((jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse failed:', error);
      return null;
    }
  }, []);

  // Safe toast function
  const safeToast = useCallback((options: any) => {
    try {
      if (toast && typeof toast === 'function') {
        toast(options);
      }
    } catch (error) {
      console.warn('Toast failed:', error);
    }
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    
    const initializeComponent = async () => {
      try {
        if (!mounted) return;
        
        setIsMounted(true);
        
        // Check if user is already logged in
        const userData = safeLocalStorage.getItem('user');
        const token = safeLocalStorage.getItem('token');
        
        if (userData && token) {
          const parsedUser = safeJsonParse(userData);
          if (parsedUser && 
              parsedUser.id && 
              parsedUser.name && 
              parsedUser.role && 
              parsedUser.email) {
            if (mounted) {
              navigate('/dashboard');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Error checking existing login:', error);
        // Clear invalid data
        safeLocalStorage.removeItem('user');
        safeLocalStorage.removeItem('token');
      }
    };

    initializeComponent();

    return () => {
      mounted = false;
    };
  }, [navigate, safeLocalStorage, safeJsonParse]);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      if (!isMounted) return null;
      
      setIsLoading(true);
      try {
        const result = await backend.auth.login(data);
        return result;
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    },
    onSuccess: (data) => {
      if (!isMounted || !data) return;
      
      try {
        if (!data || !data.user || !data.token) {
          throw new Error('Invalid response data');
        }

        if (!data.user.id || !data.user.name || !data.user.role || !data.user.email) {
          throw new Error('Invalid user data');
        }

        const userSaved = safeLocalStorage.setItem('user', JSON.stringify(data.user));
        const tokenSaved = safeLocalStorage.setItem('token', data.token);
        
        if (!userSaved || !tokenSaved) {
          throw new Error('Failed to save login data');
        }
        
        safeToast({
          title: "Login berhasil",
          description: `Selamat datang, ${data.user.name}!`,
        });
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing login success:', error);
        safeToast({
          title: "Login gagal",
          description: "Terjadi kesalahan saat memproses login",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      if (!isMounted) return;
      
      console.error('Login error:', error);
      let errorMessage = "Email atau password salah";
      
      try {
        if (error && typeof error === 'object') {
          if (error.message) {
            errorMessage = error.message;
          } else if (error.details) {
            errorMessage = error.details;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
      }
      
      safeToast({
        title: "Login gagal",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMounted) return;
    
    if (!email || !password) {
      safeToast({
        title: "Error",
        description: "Email dan password harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      safeToast({
        title: "Error",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 3) {
      safeToast({
        title: "Error",
        description: "Password minimal 3 karakter",
        variant: "destructive",
      });
      return;
    }

    try {
      loginMutation.mutate({ email: email.trim(), password: password.trim() });
    } catch (error) {
      console.error('Error submitting login:', error);
    }
  }, [isMounted, email, password, loginMutation, safeToast]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target) return;
    const value = e.target.value || '';
    setEmail(value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target) return;
    const value = e.target.value || '';
    setPassword(value);
  }, []);

  const isSubmitting = isLoading || loginMutation.isPending;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
