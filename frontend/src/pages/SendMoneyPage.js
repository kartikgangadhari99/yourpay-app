import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';
import './SendMoneyPage.css';
import './SetPinPage.css';

const STEPS = ['Receiver', 'Amount', 'PIN', 'Done'];

export default function SendMoneyPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [receiverUpi, setReceiverUpi] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [txnResult, setTxnResult] = useState(null);

  const searchReceiver = async () => {
    if (!receiverUpi.trim()) return toast.error('Enter a UPI ID');
    setLoading(true);
    try {
      const res = await api.get(`/user/search?upiId=${receiverUpi.trim()}`);
      setReceiver(res.data.user);
      setStep(1);
    } catch {
      toast.error('UPI ID not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[index] = val;
    setPin(next);
    if (val && index < 3) document.getElementById(`txn-pin-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) document.getElementById(`txn-pin-${index - 1}`)?.focus();
  };

  const handleSend = async () => {
    const pinStr = pin.join('');
    if (pinStr.length !== 4) return toast.error('Enter your 4-digit PIN');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Invalid amount');
    setLoading(true);
    try {
      const res = await api.post('/payment/send', { receiverUpi: receiver.upiId, amount: amt, pin: pinStr, note });
      setTxnResult(res.data);
      updateUser({ walletBalance: res.data.newBalance });
      setStep(3);
      toast.success('Payment successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPin(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const res = await api.get(`/payment/receipt/${txnResult.transaction.transactionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${txnResult.transaction.transactionId}.pdf`;
      a.click();
    } catch { toast.error('Failed to download receipt'); }
  };

  return (
    <Layout>
      <div className="send-page">
        <h2 className="page-title">Send Money</h2>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <Card>
          {/* Step 0: Receiver */}
          {step === 0 && (
            <div className="step-content">
              <h3>Enter Receiver's UPI ID</h3>
              <p className="step-desc">Search by UPI ID (e.g. kartik1234@yourpay)</p>
              <Input
                label="UPI ID"
                placeholder="name1234@yourpay"
                value={receiverUpi}
                onChange={e => setReceiverUpi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchReceiver()}
              />
              <Button fullWidth size="lg" loading={loading} onClick={searchReceiver} style={{ marginTop: 14 }}>
                Search
              </Button>
            </div>
          )}

          {/* Step 1: Amount */}
          {step === 1 && receiver && (
            <div className="step-content">
              <div className="receiver-info">
                <div className="receiver-avatar">{receiver.name?.charAt(0)}</div>
                <div>
                  <div className="receiver-name">{receiver.name}</div>
                  <div className="receiver-upi">{receiver.upiId}</div>
                </div>
              </div>
              <div className="amount-input-wrap">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  className="amount-input"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  autoFocus
                />
              </div>
              <div className="quick-amounts">
                {[100, 200, 500, 1000].map(a => (
                  <button key={a} className="quick-amt" onClick={() => setAmount(String(a))}>₹{a}</button>
                ))}
              </div>
              <Input label="Note (optional)" placeholder="What's this for?" value={note} onChange={e => setNote(e.target.value)} />
              <div className="step-actions">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => { if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount'); setStep(2); }}>Proceed</Button>
              </div>
            </div>
          )}

          {/* Step 2: PIN */}
          {step === 2 && (
            <div className="step-content">
              <h3>Enter UPI PIN</h3>
              <div className="confirm-summary">
                <div className="confirm-row"><span>Sending to</span><strong>{receiver?.name}</strong></div>
                <div className="confirm-row"><span>Amount</span><strong className="confirm-amount">{formatCurrency(parseFloat(amount))}</strong></div>
                {note && <div className="confirm-row"><span>Note</span><strong>{note}</strong></div>}
                <div className="confirm-row"><span>Balance after</span><strong>{formatCurrency((user?.walletBalance || 0) - parseFloat(amount))}</strong></div>
              </div>
              <div className="pin-inputs">
                {pin.map((d, i) => (
                  <input key={i} id={`txn-pin-${i}`} type="password" inputMode="numeric" maxLength={1} className="pin-box" value={d} onChange={e => handlePinChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
                ))}
              </div>
              <div className="step-actions">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button loading={loading} onClick={handleSend}>Pay Now</Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && txnResult && (
            <div className="step-content success-state">
              <div className="success-icon">✓</div>
              <h3>Payment Successful!</h3>
              <p>{formatCurrency(parseFloat(amount))} sent to {receiver?.name}</p>
              <div className="txn-id">Txn ID: {txnResult.transaction?.transactionId}</div>
              <div className="success-actions">
                <Button onClick={downloadReceipt} variant="secondary">Download Receipt</Button>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
