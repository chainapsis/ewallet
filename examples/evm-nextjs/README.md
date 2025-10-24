## Keplr Embedded Ethereum SDK + Next.js Example

A minimal example that integrates Keplr Embedded Ethereum SDK with Next.js. It
connects to the Ethereum Sepolia testnet by default and demonstrates social
sign-in, account info, and a simple transfer transaction.

### Requirements

- Node.js 22+
- Yarn (workspaces)

### Environment Variables

Create a `.env.local` file in this directory and set your Keplr Embedded API
key.

```bash
cp .env.example .env.local
```

```bash
# .env.local
NEXT_PUBLIC_KEPLR_EMBEDDED_API_KEY=YOUR_ISSUED_API_KEY
```

Note: Use the API key issued from the
[Keplr Embedded Dashboard](https://dapp.oko.app).

### How to Run

```bash
yarn install
yarn dev
```

Open `http://localhost:3000` in your browser.
