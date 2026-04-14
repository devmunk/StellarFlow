/**
 * freighter.js — Freighter wallet integration service
 * Wraps @stellar/freighter-api for React usage
 */

import {
  isConnected,
  getPublicKey,
  signTransaction,
  requestAccess,
} from '@stellar/freighter-api';

/**
 * Check whether the Freighter extension is installed in the browser.
 * Returns true if Freighter is present.
 *
 * @returns {Promise<boolean>}
 */
export async function checkFreighterInstalled() {
  try {
    const connected = await isConnected();
    // isConnected() returns an object: { isConnected: boolean } in v2
    return connected?.isConnected === true || connected === true;
  } catch {
    return false;
  }
}

/**
 * Connect to the Freighter wallet and return the user's public key.
 * Will prompt user to grant access if not already allowed.
 *
 * @returns {Promise<string>} — Stellar public key (G...)
 */
export async function connectFreighter() {
  // First check if extension is present
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error(
      'Freighter wallet is not installed. Please install it from https://freighter.app'
    );
  }

  // Request access (shows popup if first time)
  const accessResult = await requestAccess();

  // Handle v2 API response shape { address } or v1 string
  if (accessResult?.error) {
    throw new Error(accessResult.error);
  }

  // Get public key
  const keyResult = await getPublicKey();

  // Handle v2 API response { address } vs v1 string
  const publicKey = keyResult?.address || keyResult;

  if (!publicKey || typeof publicKey !== 'string' || !publicKey.startsWith('G')) {
    throw new Error('Could not retrieve public key from Freighter. Make sure you are on Testnet.');
  }

  return publicKey;
}

/**
 * Get currently connected public key without prompting.
 * Returns null if not connected.
 *
 * @returns {Promise<string|null>}
 */
export async function getConnectedPublicKey() {
  try {
    const installed = await checkFreighterInstalled();
    if (!installed) return null;

    const keyResult = await getPublicKey();
    const publicKey = keyResult?.address || keyResult;

    if (publicKey && typeof publicKey === 'string' && publicKey.startsWith('G')) {
      return publicKey;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sign a transaction XDR string using Freighter.
 * This is passed into the sendXLM utility.
 *
 * @param {string} xdr — transaction XDR
 * @param {object} opts — { networkPassphrase, network }
 * @returns {Promise<string>} — signed transaction XDR
 */
export async function freighterSignTransaction(xdr, opts) {
  const result = await signTransaction(xdr, opts);

  // v2 returns { signedTxXdr } or string in v1
  if (result?.error) {
    throw new Error(result.error);
  }

  const signed = result?.signedTxXdr || result;

  if (!signed || typeof signed !== 'string') {
    throw new Error('Transaction signing was cancelled or failed');
  }

  return signed;
}
