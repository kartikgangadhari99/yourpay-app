import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import './AuthPage.css';
import './SetPinPage.css';

export default function SetPinPage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[index] = val;
    setPin(next);
    if (val && index < 3) document.getElementById(`pin-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pinStr = pin.join('');
    if (pinStr.length !== 4) return toast.error('Enter all 4 digits');
    setLoading(true);
    try {
      await api.post('/user/set-pin', { pin: pinStr });
      updateUser({ hasPinSet: true });
      toast.success('UPI PIN set successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">₹</div>
        <h1>YourPay</h1>
        <p>Set your UPI PIN</p>
      </div>
      <div className="auth-card">
        <h2>Set UPI PIN</h2>
        <p className="auth-sub">This PIN will be required for every payment</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="pin-inputs">
            {pin.map((digit, i) => (
              <input
                key={i}
                id={`pin-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                className="pin-box"
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            ))}
          </div>
          <Button type="submit" fullWidth size="lg" loading={loading}>Set PIN & Continue</Button>
          <button type="button" className="skip-btn" onClick={() => navigate('/dashboard')}>Skip for now</button>
        </form>
      </div>
    </div>
  );
}
