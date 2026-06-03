import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import './TransactionHistoryPage.css';

export default function TransactionHistoryPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/payment/history?page=${page}&limit=10`)
      .then(res => { setTxns(res.data.transactions); setPages(res.data.pages); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  const downloadReceipt = async (txnId) => {
    try {
      const res = await api.get(`/payment/receipt/${txnId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `receipt-${txnId}.pdf`; a.click();
    } catch { toast.error('Failed to download receipt'); }
  };

  return (
    <Layout>
      <div className="history-page">
        <div className="history-header">
          <h2 className="page-title">Transaction History</h2>
          <span className="total-badge">{total} transactions</span>
        </div>

        <Card>
          {loading ? (
            <div className="loading-state">Loading transactions...</div>
          ) : txns.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">≡</div><p>No transactions found</p></div>
          ) : (
            <>
              <div className="txn-table">
                {txns.map(txn => (
                  <div key={txn._id} className="txn-row">
                    <div className={`txn-row__icon ${txn.type}`}>{txn.type === 'debit' ? '↑' : '↓'}</div>
                    <div className="txn-row__info">
                      <div className="txn-row__name">
                        {txn.type === 'debit' ? `To: ${txn.receiverId?.name}` : `From: ${txn.senderId?.name}`}
                      </div>
                      <div className="txn-row__upi">
                        {txn.type === 'debit' ? txn.receiverUpi : txn.senderUpi}
                      </div>
                      <div className="txn-row__date">{formatDateTime(txn.createdAt)}</div>
                    </div>
                    <div className="txn-row__right">
                      <div className={`txn-row__amount ${txn.type}`}>
                        {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                      </div>
                      <span className={`status-badge status-badge--${txn.status}`}>{txn.status}</span>
                      {txn.type === 'debit' && (
                        <button className="receipt-btn" onClick={() => downloadReceipt(txn.transactionId)} title="Download Receipt">⤓</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pages > 1 && (
                <div className="pagination">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <span className="page-info">Page {page} of {pages}</span>
                  <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
