/**
 * useWallet.js — Custom React hook for wallet state management
 * Centralizes wallet connection, disconnection, and public key state
 */

import { useState, useEffect, useCallback } from 'react';
import { connectFreighter, getConnectedPublicKey, checkFreighterInstalled } from '../services/freighter.js';

/**
 * @typedef {Object} WalletState
 * @property {string|null} publicKey - Connected wallet public key
 * @property {boolean} connected - Whether wallet is connected
 * @property {boolean} connecting - Whether connection is in progress
 * @property {boolean} freighterInstalled - Whether Freighter extension is installed
 * @property {string|null} error - Connection error message
 * @property {Function} connect - Function to connect wallet
 * @property {Function} disconnect - Function to disconnect wallet
 */

/**
 * @returns {WalletState}
 */
export function useWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [freighterInstalled, setFreighterInstalled] = useState(null); // null = unknown

  // On mount: check if Freighter is installed and if already connected
  useEffect(() => {
    async function checkInitialState() {
      const installed = await checkFreighterInstalled();
      setFreighterInstalled(installed);

      if (installed) {
        // Try to restore existing connection without prompting
        const existingKey = await getConnectedPublicKey();
        if (existingKey) {
          setPublicKey(existingKey);
        }
      }
    }
    checkInitialState();
  }, []);

  /** Connect wallet — triggers Freighter popup */
  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const key = await connectFreighter();
      setPublicKey(key);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  /** Disconnect wallet — clears local state only (Freighter has no disconnect API) */
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    freighterInstalled,
    error,
    connect,
    disconnect,
  };
}
