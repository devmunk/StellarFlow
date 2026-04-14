/**
 * App.jsx — Root component
 * Composes WalletCard, BalanceCard, SendForm
 * Passes wallet state down from useWallet hook
 */

import React, { useRef } from 'react';
import { useWallet } from './utils/useWallet.js';
import WalletCard from './components/WalletCard.jsx';
import BalanceCard from './components/BalanceCard.jsx';
import SendForm from './components/SendForm.jsx';

export default function App() {
  const { publicKey, connected, connecting, freighterInstalled, error, connect, disconnect } =
    useWallet();

  // Ref to trigger balance refresh after a successful transaction
  const balanceRef = useRef(null);

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">✦</div>
          <div className="logo-text">
            Stellar<span>Flow</span>
          </div>
        </div>
        <div className="network-badge">⬡ Testnet</div>
      </header>

      {/* ── Main content ── */}
      <main className="main-content">
        {/* Wallet connection card */}
        <WalletCard
          publicKey={publicKey}
          connected={connected}
          connecting={connecting}
          freighterInstalled={freighterInstalled}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* Show balance + send form only when connected */}
        {connected && (
          <>
            <BalanceCard
              ref={balanceRef}
              publicKey={publicKey}
            />

            <SendForm
              senderPublicKey={publicKey}
              onTransactionSuccess={() => {
                // Trigger balance refresh 2s after tx success (ledger close time)
                setTimeout(() => {
                  balanceRef.current?.refresh?.();
                }, 2000);
              }}
            />

            {/* Friendbot info banner */}
            <div className="alert alert-info">
              <span className="alert-icon">💡</span>
              <div>
                Need test XLM?{' '}
                <a
                  href={`https://friendbot.stellar.org?addr=${publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Fund your account via Friendbot →
                </a>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <div>Built on Stellar Testnet · Freighter Wallet</div>
        <div>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
            stellar.org
          </a>{' '}
          ·{' '}
          <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">
            freighter.app
          </a>{' '}
          ·{' '}
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
          >
            explorer
          </a>
        </div>
      </footer>
    </div>
  );
}
