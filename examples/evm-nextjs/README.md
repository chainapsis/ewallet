## Keplr Embedded Ethereum SDK + Next.js Example

A minimal example that integrates Keplr Embedded Ethereum SDK with Next.js. It connects to the Ethereum Sepolia testnet by default and demonstrates social sign-in, account info, and a simple transfer transaction.

### Requirements

- Node.js 22+
- Yarn (workspaces)

### Environment Variables

Create a `.env.local` file in this package (`packages/evm`) and set your Keplr Embedded API key.

```bash
# packages/evm/.env.local
NEXT_PUBLIC_KEPLR_EMBEDDED_API_KEY=YOUR_ISSUED_API_KEY
```

Note: Use the API key issued from the [Keplr Embedded Dashboard](https://dapp.embed.keplr.app).

### How to Run

1. From the repository root (recommended)

```bash
# Install dependencies at the root
yarn install

# Start the EVM example dev server
yarn dev:evm
```

2. From this package directly

```bash
cd packages/evm
yarn install
yarn dev
```

Open `http://localhost:3000` in your browser.
