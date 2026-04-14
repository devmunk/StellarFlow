/**
 * stellar.js — Utility functions for Stellar Testnet interactions
 * Uses Stellar SDK v12 with Horizon testnet server
 */

import * as StellarSdk from '@stellar/stellar-sdk';

// ── Network constants ──────────────────────────────────────────────
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;

// Horizon server instance — used for all RPC calls
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

/**
 * Fetch the XLM (native) balance for a given public key.
 * Returns the balance as a string, or throws on error.
 *
 * @param {string} publicKey — Stellar G... public key
 * @returns {Promise<string>} — XLM balance e.g. "100.0000000"
 */
export async function fetchXLMBalance(publicKey) {
  if (!publicKey) throw new Error('No public key provided');

  const account = await server.loadAccount(publicKey);

  // Find the native (XLM) balance among all balances
  const nativeBalance = account.balances.find(b => b.asset_type === 'native');

  if (!nativeBalance) throw new Error('No XLM balance found on account');

  return nativeBalance.balance; // e.g. "100.0000000"
}

/**
 * Send XLM from the connected wallet to a recipient.
 * The transaction is built, then sent to Freighter for signing,
 * and finally submitted to the network.
 *
 * @param {string} senderPublicKey — sender's Stellar G... public key
 * @param {string} recipientAddress — recipient's Stellar G... public key
 * @param {string|number} amount — XLM amount as string or number
 * @param {Function} signTransaction — Freighter's signTransaction function
 * @returns {Promise<{hash: string, ledger: number}>} — transaction result
 */
export async function sendXLM(senderPublicKey, recipientAddress, amount, signTransaction) {
  // ── 1. Validate recipient address ──
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress)) {
    throw new Error('Invalid recipient Stellar address');
  }

  // ── 2. Validate amount ──
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number');
  }
  if (amountNum < 0.0000001) {
    throw new Error('Amount is too small (minimum 0.0000001 XLM)');
  }

  // ── 3. Load sender account (for sequence number) ──
  const sourceAccount = await server.loadAccount(senderPublicKey);

  // ── 4. Check balance (including base reserve) ──
  const nativeBalance = sourceAccount.balances.find(b => b.asset_type === 'native');
  const currentBalance = parseFloat(nativeBalance?.balance || '0');
  // Stellar requires a minimum balance of 1 XLM (base reserve) + 0.00001 fee
  const minimumReserve = 1.0;
  const fee = 0.00001;
  if (amountNum + minimumReserve + fee > currentBalance) {
    throw new Error(
      `Insufficient balance. You have ${currentBalance.toFixed(7)} XLM but need at least ${(amountNum + minimumReserve + fee).toFixed(7)} XLM (including 1 XLM reserve)`
    );
  }

  // ── 5. Build the transaction ──
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE, // currently 100 stroops = 0.00001 XLM
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientAddress,
        asset: StellarSdk.Asset.native(), // XLM
        amount: amountNum.toFixed(7),     // Stellar requires 7 decimal places
      })
    )
    .setTimeout(180) // 3 minute timeout for signing
    .build();

  // ── 6. Convert to XDR for Freighter to sign ──
  const transactionXDR = transaction.toXDR();

  // ── 7. Request signature from Freighter ──
  const signedXDR = await signTransaction(transactionXDR, {
    networkPassphrase: NETWORK_PASSPHRASE,
    network: 'TESTNET',
  });

  // ── 8. Reconstruct the signed transaction from XDR ──
  const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXDR,
    NETWORK_PASSPHRASE
  );

  // ── 9. Submit to Horizon ──
  const result = await server.submitTransaction(signedTransaction);

  return {
    hash: result.hash,
    ledger: result.ledger,
  };
}

/**
 * Shorten a Stellar public key for display.
 * e.g. "GABCD...WXYZ"
 *
 * @param {string} publicKey
 * @param {number} chars — chars to show on each side (default 6)
 * @returns {string}
 */
export function shortenAddress(publicKey, chars = 6) {
  if (!publicKey || publicKey.length < chars * 2) return publicKey;
  return `${publicKey.slice(0, chars)}...${publicKey.slice(-chars)}`;
}

/**
 * Check if a string is a valid Stellar public key.
 *
 * @param {string} address
 * @returns {boolean}
 */
export function isValidStellarAddress(address) {
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Get the Stellar Expert explorer URL for a transaction.
 *
 * @param {string} hash — transaction hash
 * @returns {string} URL
 */
export function getExplorerUrl(hash) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
