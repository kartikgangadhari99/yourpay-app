import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Layout from '../components/common/Layout';
import Card, { StatCard } from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './AdminPage.css';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [txns, setTxns] = useState([]);
  const [chart, setChart] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, uRes, tRes, cRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users?limit=20'),
          api.get('/admin/transactions?limit=20'),
          api.get('/admin/monthly-report'),
        ]);
        setStats(sRes.data.stats);
        setUsers(uRes.data.users);
        setTxns(tRes.data.transactions);
        setChart(cRes.data.report);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return <Layout><div className="admin-loading">Loading admin data...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h2 className="page-title">Admin Dashboard</h2>

        {/* Stats */}
        <div className="admin-stats">
          <StatCard icon="👥" label="Total Users" value={stats?.totalUsers} color="blue" />
          <StatCard icon="↕" label="Transactions" value={stats?.totalTransactions} color="amber" />
          <StatCard icon="✓" label="Successful" value={stats?.successfulPayments} color="green" />
          <StatCard icon="✕" label="Failed" value={stats?.failedPayments} color="red" />
          <StatCard icon="₹" label="Total Transferred" value={formatCurrency(stats?.totalAmountTransferred || 0)} color="blue" />
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'users', 'transactions'].map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <Card>
            <h3 className="card-title">Monthly Transactions</h3>
            {chart.length === 0 ? (
              <div className="empty-chart">No transaction data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                    formatter={(val, name) => [name === 'amount' ? formatCurrency(val) : val, name === 'amount' ? 'Amount' : 'Count']}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4,4,0,0]} name="count" />
                  <Bar dataKey="amount" fill="#22c55e" radius={[4,4,0,0]} name="amount" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {tab === 'users' && (
          <Card>
            <h3 className="card-title">All Users</h3>
            <div className="admin-table">
              <div className="admin-table-header">
                <span>Name / Email</span>
                <span>UPI ID</span>
                <span>Balance</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {users.map(u => (
                <div key={u._id} className="admin-table-row">
                  <div>
                    <div className="admin-name">{u.name}</div>
                    <div className="admin-email">{u.email}</div>
                  </div>
                  <div className="admin-mono">{u.upiId}</div>
                  <div>{formatCurrency(u.walletBalance)}</div>
                  <div>
                    <span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <Button size="sm" variant={u.isActive ? 'danger' : 'success'} onClick={() => toggleUser(u._id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'transactions' && (
          <Card>
            <h3 className="card-title">All Transactions</h3>
            <div className="admin-txn-list">
              {txns.map(txn => (
                <div key={txn._id} className="admin-txn-row">
                  <div>
                    <div className="admin-name">{txn.senderId?.name} → {txn.receiverId?.name}</div>
                    <div className="admin-email">{txn.senderUpi} → {txn.receiverUpi}</div>
                    <div className="admin-date">{formatDateTime(txn.createdAt)}</div>
                  </div>
                  <div className="txn-right">
                    <div className="admin-amount">{formatCurrency(txn.amount)}</div>
                    <span className={`status-badge status-badge--${txn.status}`}>{txn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
