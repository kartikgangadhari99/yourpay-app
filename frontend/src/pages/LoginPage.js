import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">₹</div>
        <h1>YourPay</h1>
        <p>Digital Payment Simulation</p>
      </div>
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email or Mobile" type="text" placeholder="Enter email or mobile" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <Input label="Password" type="password" placeholder="Enter password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <Button type="submit" fullWidth size="lg" loading={loading}>Sign In</Button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
        <div className="auth-demo">
          <p>Demo Admin: <strong>admin@yourpay.com</strong> / <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}
