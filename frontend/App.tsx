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

const queryClient = new QueryClient();

function AppInner() {
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
