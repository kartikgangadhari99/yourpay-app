import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import './WalletPage.css';

const PRESETS = [500, 1000, 2000, 5000, 10000];

export default function WalletPage() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > 100000) return toast.error('Maximum ₹1,00,000 at a time');
    setLoading(true);
    try {
      const res = await api.post('/wallet/add-money', { amount: amt });
      updateUser({ walletBalance: res.data.walletBalance });
      toast.success(`₹${amt} added to wallet!`);
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="wallet-page">
        <h2 className="page-title">Wallet</h2>

        <div className="wallet-balance-card">
          <div className="wbc-label">Available Balance</div>
          <div className="wbc-amount">{formatCurrency(user?.walletBalance || 0)}</div>
          <div className="wbc-upi">{user?.upiId}</div>
        </div>

        <Card>
          <h3 className="card-title">Add Demo Money</h3>
          <p className="card-desc">Add simulated balance to your wallet for testing payments</p>
          <div className="preset-grid">
            {PRESETS.map(p => (
              <button key={p} className={`preset-btn ${amount == p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>
                {formatCurrency(p)}
              </button>
            ))}
          </div>
          <div className="custom-amount-row">
            <div className="custom-input-wrap">
              <span>₹</span>
              <input
                type="number"
                className="custom-input"
                placeholder="Custom amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                max="100000"
              />
            </div>
            <Button size="lg" loading={loading} onClick={handleAdd}>Add Money</Button>
          </div>
          <p className="disclaimer-text">⚠ This is simulated money for testing purposes only. No real transactions.</p>
        </Card>

        <Card>
          <h3 className="card-title">Wallet Info</h3>
          <div className="info-rows">
            <div className="info-row"><span>Wallet Status</span><span className="badge-active">Active</span></div>
            <div className="info-row"><span>UPI ID</span><span className="mono-val">{user?.upiId}</span></div>
            <div className="info-row"><span>PIN Status</span><span className={user?.hasPinSet ? 'badge-active' : 'badge-pending'}>{user?.hasPinSet ? 'Set' : 'Not Set'}</span></div>
            <div className="info-row"><span>Account Type</span><span>Demo Wallet</span></div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
