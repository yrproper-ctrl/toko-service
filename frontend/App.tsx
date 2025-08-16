import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CheckStatusPage from './pages/CheckStatusPage';
import ServiceFormPage from './pages/ServiceFormPage';
import ServiceListPage from './pages/ServiceListPage';
import UserManagementPage from './pages/UserManagementPage';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry if it's a network error that might be caused by extensions
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message?.toLowerCase() || '';
          if (message.includes('extension') || message.includes('chrome-extension')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppInner() {
  useEffect(() => {
    // Add error boundary for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if the error is from a browser extension
      if (event.reason && typeof event.reason === 'object') {
        const stack = event.reason.stack || '';
        const message = event.reason.message || '';
        
        if (stack.includes('chrome-extension://') || 
            message.includes('chrome-extension://') ||
            stack.includes('binanceInjectedProvider') ||
            message.includes('binanceInjectedProvider')) {
          // Prevent the error from being logged to console
          event.preventDefault();
          return;
        }
      }
    };

    // Add error boundary for general errors
    const handleError = (event: ErrorEvent) => {
      // Check if the error is from a browser extension
      if (event.filename && event.filename.includes('chrome-extension://')) {
        event.preventDefault();
        return;
      }
      
      if (event.error && typeof event.error === 'object') {
        const stack = event.error.stack || '';
        if (stack.includes('chrome-extension://') || 
            stack.includes('binanceInjectedProvider')) {
          event.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route path="/service/new" element={<ServiceFormPage />} />
          <Route path="/service/list" element={<ServiceListPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
