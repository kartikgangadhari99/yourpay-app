import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SendMoneyPage from './pages/SendMoneyPage';
import ReceiveMoneyPage from './pages/ReceiveMoneyPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SetPinPage from './pages/SetPinPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontSize:'18px' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    <Route path="/send" element={<PrivateRoute><SendMoneyPage /></PrivateRoute>} />
    <Route path="/receive" element={<PrivateRoute><ReceiveMoneyPage /></PrivateRoute>} />
    <Route path="/history" element={<PrivateRoute><TransactionHistoryPage /></PrivateRoute>} />
    <Route path="/wallet" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
    <Route path="/set-pin" element={<PrivateRoute><SetPinPage /></PrivateRoute>} />
    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
