## Keplr Embedded Cosmos SDK + Next.js Example

A minimal example that integrates Keplr Embedded Cosmos SDK with Next.js. It connects to the Osmosis Testnet by default and demonstrates social sign-in, account info, and a simple transfer transaction.

### Requirements

- Node.js 22+
- Yarn (workspaces)

### Environment Variables

Create a `.env.local` file in this package (`packages/cosmos`) and set your Keplr Embedded API key.

```bash
# packages/cosmos/.env.local
NEXT_PUBLIC_KEPLR_EMBEDDED_API_KEY=YOUR_ISSUED_API_KEY
```

Note: Use the API key issued from the [Keplr Embedded Dashboard](https://dapp.embed.keplr.app).

### How to Run

1. From the repository root (recommended)

```bash
# Install dependencies at the root
yarn install

# Start the Cosmos example dev server
yarn dev
```

2. From this package directly

```bash
cd packages/cosmos
yarn install
yarn dev
```

Open `http://localhost:3000` in your browser.
