# Keplr Embedded Multi‑Ecosystem (React + Vite)

React + Vite example that connects to both Cosmos (Osmosis testnet) and EVM (Ethereum Sepolia) using Keplr Embedded. Shows social sign‑in, account display, and simple transfers for each ecosystem.

### Requirements

- Node.js 22+
- Yarn (workspaces)

### Environment Variables

Create a `.env` file in this package (`packages/multi-ecosystem`) and set your Keplr Embedded API key:

```bash
# packages/multi-ecosystem/.env
VITE_KEPLR_EMBEDDED_API_KEY=YOUR_ISSUED_API_KEY
```

Get your API key from the [Keplr Embedded Dashboard](https://dapp.embed.keplr.app).

### How to Run

1. From the repository root (recommended)

```bash
# Install dependencies at the root
yarn install

# Start the multi-ecosystem example dev server
yarn dev:multi-ecosystem
```

2. From this package directly

```bash
yarn install
cd packages/multi-ecosystem
yarn dev
```

Open `http://localhost:5173` in your browser.
