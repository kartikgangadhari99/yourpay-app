import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';
import './ProfilePage.css';
import './SetPinPage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showChangePin, setShowChangePin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePinChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...newPin]; next[i] = val; setNewPin(next);
    if (val && i < 3) document.getElementById(`new-pin-${i + 1}`)?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !newPin[i] && i > 0) document.getElementById(`new-pin-${i - 1}`)?.focus();
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    const newPinStr = newPin.join('');
    if (!oldPin || oldPin.length !== 4) return toast.error('Enter current PIN (4 digits)');
    if (newPinStr.length !== 4) return toast.error('Enter all 4 digits of new PIN');
    setLoading(true);
    try {
      await api.post('/user/change-pin', { oldPin, newPin: newPinStr });
      toast.success('PIN changed successfully!');
      setShowChangePin(false);
      setOldPin('');
      setNewPin(['', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-page">
        <h2 className="page-title">Profile</h2>

        <Card className="profile-header-card">
          <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <p>{user?.mobile}</p>
          </div>
        </Card>

        <Card>
          <h3 className="card-title">Account Details</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>UPI ID</span><span className="mono">{user?.upiId}</span></div>
            <div className="detail-row"><span>Wallet Balance</span><strong>{formatCurrency(user?.walletBalance || 0)}</strong></div>
            <div className="detail-row"><span>Account Role</span><span className="role-badge">{user?.role}</span></div>
            <div className="detail-row"><span>UPI PIN</span>
              <span className={user?.hasPinSet ? 'set-badge' : 'notset-badge'}>{user?.hasPinSet ? '●●●● Set' : 'Not Set'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="section-header-row">
            <h3 className="card-title">Security</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowChangePin(!showChangePin)}>
              {showChangePin ? 'Cancel' : 'Change PIN'}
            </Button>
          </div>

          {showChangePin && (
            <form onSubmit={handleChangePin} className="change-pin-form">
              <Input
                label="Current PIN"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter current 4-digit PIN"
                value={oldPin}
                onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))}
              />
              <div>
                <label className="input-label">New PIN</label>
                <div className="pin-inputs" style={{ justifyContent: 'flex-start', marginTop: 6 }}>
                  {newPin.map((d, i) => (
                    <input key={i} id={`new-pin-${i}`} type="password" inputMode="numeric" maxLength={1}
                      className="pin-box" value={d}
                      onChange={e => handlePinChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)} />
                  ))}
                </div>
              </div>
              <Button type="submit" loading={loading}>Update PIN</Button>
            </form>
          )}

          {!showChangePin && (
            <p className="security-note">Your UPI PIN is encrypted and never stored in plain text.</p>
          )}
        </Card>
      </div>
    </Layout>
  );
}
