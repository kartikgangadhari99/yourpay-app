import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import './DashboardPage.css';

const quickActions = [
  { to: '/send', icon: '↑', label: 'Send', color: 'blue' },
  { to: '/receive', icon: '↓', label: 'Receive', color: 'green' },
  { to: '/wallet', icon: '+', label: 'Add Money', color: 'amber' },
  { to: '/history', icon: '≡', label: 'History', color: 'purple' },
];

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, txnRes] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/payment/history?limit=5'),
        ]);
        updateUser({ walletBalance: balRes.data.walletBalance });
        setRecentTxns(txnRes.data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="dashboard">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-card__label">Wallet Balance</div>
          <div className="balance-card__amount">{formatCurrency(user?.walletBalance || 0)}</div>
          <div className="balance-card__upi">
            <span>UPI ID:</span>
            <span className="upi-id">{user?.upiId}</span>
          </div>
          {!user?.hasPinSet && (
            <Link to="/set-pin" className="pin-alert">⚠ Set your UPI PIN to start sending money</Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} className={`quick-action quick-action--${a.color}`}>
              <div className="quick-action__icon">{a.icon}</div>
              <div className="quick-action__label">{a.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <Link to="/history" className="see-all">See all →</Link>
          </div>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : recentTxns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↕</div>
              <p>No transactions yet</p>
              <Link to="/send">Send your first payment →</Link>
            </div>
          ) : (
            <div className="txn-list">
              {recentTxns.map(txn => (
                <div key={txn._id} className="txn-item">
                  <div className={`txn-icon ${txn.type}`}>
                    {txn.type === 'debit' ? '↑' : '↓'}
                  </div>
                  <div className="txn-details">
                    <div className="txn-name">
                      {txn.type === 'debit' ? txn.receiverId?.name : txn.senderId?.name}
                    </div>
                    <div className="txn-date">{formatDateTime(txn.createdAt)}</div>
                  </div>
                  <div className={`txn-amount ${txn.type}`}>
                    {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
