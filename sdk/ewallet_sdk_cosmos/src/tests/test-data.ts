import type { ChainInfo } from "@keplr-wallet/types";

// Test public keys
export const cosmosPublicKey = new Uint8Array([
  2, 133, 44, 178, 148, 26, 213, 152, 133, 12, 159, 170, 233, 219, 72, 74, 244,
  162, 157, 129, 79, 108, 61, 30, 215, 88, 236, 186, 86, 81, 186, 190, 155,
]);

export const cosmosAddress = new Uint8Array([
  52, 41, 72, 76, 122, 249, 161, 223, 244, 3, 118, 53, 28, 27, 251, 68, 235, 31,
  8, 76,
]);

export const initiaPublicKey = new Uint8Array([
  3, 120, 95, 163, 217, 82, 49, 93, 201, 111, 93, 92, 11, 194, 132, 219, 62,
  254, 49, 75, 244, 200, 222, 77, 13, 124, 93, 191, 255, 193, 95, 30, 155,
]);

export const initiaAddress = new Uint8Array([
  127, 126, 200, 18, 41, 127, 116, 200, 15, 200, 188, 175, 17, 172, 136, 29,
  200, 142, 178, 22,
]);

// Expected addresses
export const expectedCosmosBech32Address =
  "cosmos1xs55snr6lxsalaqrwc63cxlmgn437zzvmzg7te";

export const expectedInitiaBech32Address =
  "init10alvsy3f0a6vsr7ghjh3rtygrhygavsk3tscgz";

// Chain configurations
export const cosmosHubChainInfo: ChainInfo = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  rpc: "https://rpc-cosmoshub.keplr.app",
  rest: "https://lcd-cosmoshub.keplr.app",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [
    {
      coinDecimals: 6,
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
    },
  ],
  feeCurrencies: [
    {
      coinDecimals: 6,
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
    },
  ],
  stakeCurrency: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
  },
};

export const initiaChainInfo: ChainInfo = {
  chainId: "interwoven-1",
  chainName: "Initia",
  rpc: "https://rpc-initia.keplr.app",
  rest: "https://lcd-initia.keplr.app",
  bip44: { coinType: 60 },
  bech32Config: {
    bech32PrefixAccAddr: "init",
    bech32PrefixAccPub: "initpub",
    bech32PrefixValAddr: "initvaloper",
    bech32PrefixValPub: "initvaloperpub",
    bech32PrefixConsAddr: "initvalcons",
    bech32PrefixConsPub: "initvalconspub",
  },
  currencies: [
    {
      coinDenom: "INIT",
      coinMinimalDenom: "uinit",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "INIT",
      coinMinimalDenom: "uinit",
      coinDecimals: 6,
    },
  ],
  stakeCurrency: {
    coinDenom: "INIT",
    coinMinimalDenom: "uinit",
    coinDecimals: 6,
  },
};
