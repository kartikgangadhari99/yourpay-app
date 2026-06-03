import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.mobile)) return toast.error('Mobile must be 10 digits');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Your UPI ID: ${user.upiId}`);
      navigate('/set-pin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">₹</div>
        <h1>YourPay</h1>
        <p>Create your account</p>
      </div>
      <div className="auth-card">
        <h2>Get started</h2>
        <p className="auth-sub">Create your YourPay account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Full Name" placeholder="Enter your full name" value={form.name} onChange={set('name')} required />
          <Input label="Mobile Number" type="tel" placeholder="10-digit mobile number" maxLength={10} value={form.mobile} onChange={set('mobile')} required />
          <Input label="Email Address" type="email" placeholder="Enter email address" value={form.email} onChange={set('email')} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
          <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
