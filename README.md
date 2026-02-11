# Instant Invoice

Zero-backend web app for generating shareable USDC invoice links with QR codes. Settlement in seconds on Base, Arbitrum & Ethereum.

No database, no server, no accounts. The invoice is encoded entirely in the URL. The recipient opens the link, connects their wallet, and pays.

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/VibingonChain/instant-invoice-.git
cd instant-invoice-
npm install
```

### 2. WalletConnect Project ID (Required)

This app uses [RainbowKit](https://www.rainbowkit.com/) for wallet connections. You need a free WalletConnect project ID for mobile wallet support.

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create an account and a new project
3. Copy your Project ID
4. Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
```

> **Note:** Browser extension wallets (MetaMask, Coinbase Wallet, etc.) work without this, but mobile wallet connections via QR code require a valid project ID.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy

Deploy to [Vercel](https://vercel.com) with one click. Add `NEXT_PUBLIC_WC_PROJECT_ID` as an environment variable in your Vercel project settings.

## Features

- **Create invoices** with amount, recipient, chain, memo, and display name
- **QR codes** for easy mobile scanning
- **Wallet signing** — optional invoice signing for proof of origin
- **OG/Twitter cards** — rich link previews when shared on X, Telegram, Discord
- **Chain enforcement** — prompts wallet to switch to the correct chain before paying
- **Balance checks** — warns if payer has insufficient USDC
- **Expiry** — optional invoice expiration (1 hour, 24 hours, 7 days)
- **Dark theme** — responsive, mobile-first design

## Supported Chains

| Chain | USDC Contract |
|-------|--------------|
| Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Arbitrum One | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Ethereum | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

## Tests

```bash
npm test
```

53 unit tests covering payload encoding/decoding, validation, and signature canonicalization.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- wagmi v2 + RainbowKit
- viem
- qrcode.react

## License

MIT
