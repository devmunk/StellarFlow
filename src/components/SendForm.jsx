/**
 * SendForm.jsx — Form for sending XLM to a recipient
 * Includes validation, transaction submission, and result display
 */

import React, { useState } from 'react';
import { sendXLM, isValidStellarAddress, getExplorerUrl } from '../utils/stellar.js';
import { freighterSignTransaction } from '../services/freighter.js';

export default function SendForm({ senderPublicKey, onTransactionSuccess }) {
  // Form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  // Validation errors
  const [recipientError, setRecipientError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Transaction state
  const [sending, setSending] = useState(false);
  const [txResult, setTxResult] = useState(null); // { success, hash, error }

  /** Validate recipient address on blur */
  const validateRecipient = (value) => {
    if (!value) {
      setRecipientError('Recipient address is required');
      return false;
    }
    if (!isValidStellarAddress(value)) {
      setRecipientError('Invalid Stellar address (must be a 56-character public key starting with G)');
      return false;
    }
    // if (value === senderPublicKey) {
    //   setRecipientError('Cannot send to yourself');
    //   return false;
    // }
    setRecipientError('');
    return true;
  };

  /** Validate amount on blur */
  const validateAmount = (value) => {
    if (!value) {
      setAmountError('Amount is required');
      return false;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    if (num < 0.0000001) {
      setAmountError('Minimum amount is 0.0000001 XLM');
      return false;
    }
    setAmountError('');
    return true;
  };

  /** Handle form submission */
  const handleSend = async () => {
    // Validate all fields before submitting
    const validRecipient = validateRecipient(recipient);
    const validAmount = validateAmount(amount);

    if (!validRecipient || !validAmount) return;

    setSending(true);
    setTxResult(null);

    try {
      const result = await sendXLM(
        senderPublicKey,
        recipient,
        amount,
        freighterSignTransaction // pass Freighter signer
      );

      setTxResult({ success: true, hash: result.hash, ledger: result.ledger });

      // Notify parent to refresh balance
      if (onTransactionSuccess) onTransactionSuccess();

      // Clear the form on success
      setRecipient('');
      setAmount('');
    } catch (err) {
      // Parse Stellar SDK horizon errors for better messages
      let message = err.message || 'Transaction failed';

      // Horizon error response
      if (err?.response?.data?.extras?.result_codes) {
        const codes = err.response.data.extras.result_codes;
        if (codes.transaction === 'tx_insufficient_balance') {
          message = 'Insufficient XLM balance for this transaction';
        } else if (codes.operations?.includes('op_no_destination')) {
          message = 'Recipient account does not exist. They may need to be funded first.';
        } else if (codes.transaction === 'tx_bad_auth') {
          message = 'Transaction authorization failed';
        } else {
          message = `Transaction failed: ${JSON.stringify(codes)}`;
        }
      }

      setTxResult({ success: false, error: message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      <div className="card-label">Send XLM</div>

      {/* Recipient address input */}
      <div className="form-group">
        <label className="form-label" htmlFor="recipient">
          Recipient Address
        </label>
        <input
          id="recipient"
          className={`form-input ${recipientError ? 'error' : ''}`}
          type="text"
          placeholder="GABC...XYZ"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          onBlur={() => recipient && validateRecipient(recipient)}
          disabled={sending}
          spellCheck={false}
          autoComplete="off"
        />
        {recipientError ? (
          <div className="form-error">⚠ {recipientError}</div>
        ) : (
          <div className="form-hint">Enter a valid Stellar public key (G...)</div>
        )}
      </div>

      {/* Amount input */}
      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          Amount
        </label>
        <div className="amount-wrapper">
          <input
            id="amount"
            className={`form-input ${amountError ? 'error' : ''}`}
            type="number"
            placeholder="0.0000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => amount && validateAmount(amount)}
            disabled={sending}
            min="0"
            step="0.0000001"
          />
          <span className="amount-suffix">XLM</span>
        </div>
        {amountError ? (
          <div className="form-error">⚠ {amountError}</div>
        ) : (
          <div className="form-hint">Min. 0.0000001 XLM · 1 XLM reserve required</div>
        )}
      </div>

      {/* Send button */}
      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={handleSend}
        disabled={sending || !recipient || !amount}
      >
        {sending ? (
          <>
            <span className="spinner" style={{ width: 16, height: 16 }} />
            Sending... (sign in Freighter)
          </>
        ) : (
          <>✦ Send XLM</>
        )}
      </button>

      {/* Transaction result */}
      {txResult && (
        <div style={{ marginTop: '1.25rem' }}>
          {txResult.success ? (
            <div className="tx-result success">
              <div className="tx-result-title">
                <span>✓</span> Transaction Successful
              </div>
              <div className="tx-hash-label">Transaction Hash</div>
              <div className="tx-hash">
                <a
                  href={getExplorerUrl(txResult.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txResult.hash}
                </a>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--accent-success)' }}>
                ↗ View on Stellar Expert (Testnet)
              </div>
            </div>
          ) : (
            <div className="tx-result error">
              <div className="tx-result-title">
                <span>✗</span> Transaction Failed
              </div>
              <div className="tx-error-msg">{txResult.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
