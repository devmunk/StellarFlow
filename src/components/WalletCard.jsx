/**
 * WalletCard.jsx — Shows wallet connection state
 * Handles: not installed, disconnected, connecting, connected
 */

import React from 'react';
import { shortenAddress } from '../utils/stellar.js';

export default function WalletCard({
  publicKey,
  connected,
  connecting,
  freighterInstalled,
  error,
  onConnect,
  onDisconnect,
}) {
  // ── Freighter not installed ──
  if (freighterInstalled === false) {
    return (
      <div className="card">
        <div className="card-label">Wallet</div>
        <div className="alert alert-warning">
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Freighter not detected.</strong> Install the Freighter browser extension to use
            this app.{' '}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)' }}
            >
              Download Freighter →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Disconnected / Connect prompt ──
  if (!connected) {
    return (
      <div className="card">
        <div className="connect-wrapper">
          <div className="logo-icon" style={{ margin: '0 auto 1.5rem', width: 56, height: 56, fontSize: '1.5rem' }}>
            ✦
          </div>
          <div className="connect-hero">
            Send XLM<br />Instantly
          </div>
          <p className="connect-sub">
            Connect your Freighter wallet to start sending XLM on the Stellar Testnet.
          </p>

          {error && (
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={onConnect}
            disabled={connecting || freighterInstalled === null}
          >
            {connecting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Connecting...
              </>
            ) : (
              <>✦ Connect Freighter</>
            )}
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Make sure Freighter is set to <strong style={{ color: 'var(--accent-warning)' }}>Testnet</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── Connected ──
  return (
    <div className="card">
      <div className="card-label">Wallet</div>
      <div className="wallet-info">
        <div className="wallet-address-block">
          <div className="wallet-status">
            <span className="status-dot" />
            <span className="wallet-status-text">Connected</span>
          </div>
          <div className="wallet-address" title={publicKey}>
            {shortenAddress(publicKey, 8)}
          </div>
        </div>
        <button className="btn btn-danger" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
