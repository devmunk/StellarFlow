# ✦ StellarFlow — XLM Payment dApp

> A clean, production-ready Stellar Testnet dApp for sending XLM with Freighter wallet integration. Built with React + Vite.

![StellarFlow](https://img.shields.io/badge/Network-Stellar_Testnet-00d4ff?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React_18-61dafb?style=for-the-badge)
![Vite](https://img.shields.io/badge/Bundler-Vite_5-646cff?style=for-the-badge)

---

## 🚀 Features

- **Freighter Wallet Integration** — Connect/disconnect with one click
- **Live XLM Balance** — Fetches from Stellar Horizon with manual refresh
- **Send XLM** — Full transaction flow with address + amount validation
- **Transaction Results** — Success hash with Stellar Expert explorer link, or clear error messages
- **Edge Case Handling** — Invalid addresses, insufficient balance, unfunded accounts, wallet not installed
- **Modern UI** — Cosmic dark theme, responsive design, smooth animations
- **Auto Balance Refresh** — Updates balance after successful transactions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Custom CSS with CSS variables |
| Blockchain | Stellar SDK v12 |
| Wallet | Freighter API v2 |
| Network | Stellar Testnet (Horizon) |
| Fonts | Syne + Space Mono (Google Fonts) |

---

## 📂 Project Structure

```
stellar-payment-dapp/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config (polyfills for Stellar SDK)
├── package.json
├── .env.example                # Environment variable template
├── README.md
└── src/
    ├── main.jsx                # React DOM entry
    ├── App.jsx                 # Root component
    ├── styles.css              # Global design system
    ├── components/
    │   ├── WalletCard.jsx      # Wallet connect/disconnect UI
    │   ├── BalanceCard.jsx     # XLM balance display
    │   └── SendForm.jsx        # Transaction form + result
    ├── utils/
    │   ├── stellar.js          # Stellar SDK utilities (balance, send, format)
    │   └── useWallet.js        # Custom React hook for wallet state
    └── services/
        └── freighter.js        # Freighter API wrapper
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- **Freighter** browser extension (Chrome/Firefox/Brave)
- A modern browser

---

### Step 1 — Install Freighter Wallet

1. Visit [https://freighter.app](https://freighter.app)
2. Install the browser extension for Chrome, Firefox, or Brave
3. Create a new wallet or import an existing one
4. **Important:** Switch Freighter to **Testnet**:
   - Click the Freighter icon in your browser toolbar
   - Go to Settings → Preferences → Network
   - Select **Test Net**

---

### Step 2 — Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/stellar-payment-dapp.git
cd stellar-payment-dapp

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install
```

---

### Step 3 — Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 4 — Build for Production

```bash
npm run build
npm run preview
```

---

## 💧 Fund Your Testnet Account (Friendbot)

New Stellar Testnet accounts need to be funded before they can transact.

**Option 1 — Use the in-app link**
After connecting your wallet, click the "Fund via Friendbot →" link shown in the app.

**Option 2 — Direct URL**
Replace `YOUR_PUBLIC_KEY` with your Stellar G... address:

```
https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY
```

**Option 3 — Curl**
```bash
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
```

This will fund your account with **10,000 XLM** on Testnet (no real value).

---

## 🔗 How to Connect Freighter

1. Make sure Freighter is installed and set to **Testnet**
2. Open the app at `http://localhost:5173`
3. Click **"✦ Connect Freighter"**
4. Approve the connection in the Freighter popup
5. Your shortened public key will appear in the Wallet card
6. Your XLM balance loads automatically

To disconnect, click **"Disconnect"** in the wallet card. This only clears local state — Freighter doesn't have a server-side disconnect.

---

## 💸 Example Transaction Flow

```
1. User connects Freighter wallet
   └── App gets public key: GABC...XYZ

2. App fetches XLM balance via Horizon
   └── Balance: 9999.9999900 XLM

3. User fills in Send form:
   ├── Recipient: GDEF...UVW
   └── Amount: 10

4. User clicks "✦ Send XLM"
   ├── Client validates address & amount
   ├── Loads sender account sequence from Horizon
   ├── Builds Payment operation transaction
   ├── Sends XDR to Freighter for signing
   └── User approves in Freighter popup

5. Signed transaction submitted to Horizon Testnet
   ├── Success: hash displayed + Stellar Expert link
   └── Failure: error message displayed

6. Balance auto-refreshes after 2 seconds
```

---
## 🎥 Demo Video
[Watch Demo](./demo/StellarFlow.mp4)
## 📸 Screenshots

### Interface
[Interface](./screenshots/Interface.png)

### Wallet Connected & Balance Display
[Wallet & Balance](./screenshots/wallet_balance.png)

### Successful Transaction
[Transaction](./screenshots/transaction.png)
[Success](./screenshots/Success.png)

---

## 🔒 Environment Variables

Copy `.env.example` to `.env`. All variables have sensible defaults for Testnet:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_STELLAR_NETWORK` | `TESTNET` | Network identifier |
| `VITE_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Horizon server URL |
| `VITE_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` | Network passphrase |

---

## 🧪 Testing the App

1. Connect wallet → should show public key
2. Fund via Friendbot → balance shows ~10,000 XLM
3. Send XLM to any valid Testnet address
4. Check [Stellar Expert Testnet](https://stellar.expert/explorer/testnet) for your transaction

---

## 📦 Dependencies

```json
{
  "@stellar/freighter-api": "^2.0.0",
  "@stellar/stellar-sdk": "^12.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

---

## 🚨 Known Edge Cases Handled

- **Freighter not installed** — Shows install link
- **Unfunded account** — Shows Friendbot link
- **Invalid address** — Inline validation error
- **Insufficient balance** — Clear error with reserve explanation
- **Recipient doesn't exist** — Horizon error parsed and displayed
- **User cancels signing** — Graceful error shown
- **Network errors** — Caught and displayed

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built for Stellar Level 1 White Belt certification.*
