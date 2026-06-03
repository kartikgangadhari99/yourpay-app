import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';
import './ReceiveMoneyPage.css';

export default function ReceiveMoneyPage() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/qr/generate')
      .then(res => setQrCode(res.data.qrCode))
      .catch(() => toast.error('Failed to generate QR'))
      .finally(() => setLoading(false));
  }, []);

  const copyUpi = () => {
    navigator.clipboard.writeText(user?.upiId || '');
    toast.success('UPI ID copied!');
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `${user?.upiId}-qr.png`;
    a.click();
  };

  return (
    <Layout>
      <div className="receive-page">
        <h2 className="page-title">Receive Money</h2>
        <Card className="qr-card">
          <h3>Your Payment QR Code</h3>
          <p className="qr-desc">Ask others to scan this QR code to send you money</p>
          {loading ? (
            <div className="qr-placeholder">Generating QR...</div>
          ) : (
            <div className="qr-container">
              <img src={qrCode} alt="Payment QR Code" className="qr-image" />
            </div>
          )}
          <div className="upi-display">
            <div className="upi-label">Your UPI ID</div>
            <div className="upi-value">
              <span>{user?.upiId}</span>
              <button className="copy-btn" onClick={copyUpi}>Copy</button>
            </div>
          </div>
          <div className="user-display">
            <div className="user-avatar-lg">{user?.name?.charAt(0)}</div>
            <div className="user-display-name">{user?.name}</div>
          </div>
          <div className="qr-actions">
            <button className="qr-action-btn" onClick={downloadQR}>⤓ Download QR</button>
            <button className="qr-action-btn" onClick={copyUpi}>⎘ Copy UPI ID</button>
          </div>
        </Card>
        <Card className="instructions-card">
          <h4>How to receive money</h4>
          <ol className="instructions">
            <li>Share this QR code or your UPI ID with the sender</li>
            <li>The sender scans the QR or enters your UPI ID</li>
            <li>They enter the amount and their UPI PIN</li>
            <li>Money gets credited to your wallet instantly</li>
          </ol>
        </Card>
      </div>
    </Layout>
  );
}
