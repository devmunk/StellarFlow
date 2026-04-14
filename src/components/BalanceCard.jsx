/**
 * BalanceCard.jsx — Displays XLM balance with loading/error states
 * Uses forwardRef to expose a refresh() method to parent components
 */

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { fetchXLMBalance } from '../utils/stellar.js';

const BalanceCard = forwardRef(function BalanceCard({ publicKey }, ref) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const bal = await fetchXLMBalance(publicKey);
      setBalance(bal);
      setLastUpdated(new Date());
    } catch (err) {
      if (err?.response?.status === 404 || err.message?.includes('404')) {
        setError('Account not found on Testnet. Fund it via Friendbot first.');
      } else {
        setError(err.message || 'Failed to fetch balance');
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useImperativeHandle(ref, () => ({ refresh: loadBalance }));

  useEffect(() => { loadBalance(); }, [loadBalance]);

  const formatBalance = (bal) => {
    if (!bal) return { whole: '0', decimal: '.0000000' };
    const [whole, decimal = '0000000'] = bal.split('.');
    return { whole, decimal: `.${decimal}` };
  };

  const { whole, decimal } = formatBalance(balance);

  return (
    <div className="card">
      <div className="card-label">XLM Balance</div>
      {loading && (
        <div className="balance-loading">
          <span className="spinner" />
          Fetching balance...
        </div>
      )}
      {!loading && error && (
        <>
          <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
            <span className="alert-icon">⚠️</span>
            <div>
              <div>{error}</div>
              {error.includes('Fund') && (
                <a href={`https://friendbot.stellar.org?addr=${publicKey}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'block' }}>
                  Fund with Friendbot →
                </a>
              )}
            </div>
          </div>
          <button className="refresh-btn" onClick={loadBalance}>↻ Retry</button>
        </>
      )}
      {!loading && !error && balance !== null && (
        <>
          <div className="balance-display">
            <span className="balance-amount">
              {whole}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{decimal}</span>
            </span>
            <span className="balance-currency">XLM</span>
          </div>
          <div className="balance-usd">Testnet — not real value</div>
          {lastUpdated && (
            <button className="refresh-btn" onClick={loadBalance}>
              ↻ Refresh · {lastUpdated.toLocaleTimeString()}
            </button>
          )}
        </>
      )}
    </div>
  );
});

export default BalanceCard;
