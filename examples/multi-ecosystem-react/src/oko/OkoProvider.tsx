import { createContext, useEffect, useState } from "react";
import {
  CosmosEWallet,
  getBech32Address,
  getCosmosAddress,
  type CosmosEWalletInterface,
} from "@oko-wallet/oko-sdk-cosmos";
import {
  EthEWallet,
  type EthEWalletInterface,
  type EIP1193Provider,
} from "@oko-wallet/oko-sdk-eth";
import type { ChainInfo } from "@keplr-wallet/types";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Address } from "viem";

interface OkoProviderValues {
  isReady: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  // cosmos
  publicKey: Uint8Array | null;
  bech32Address: string | null;
  offlineSigner: OfflineDirectSigner | null;
  chainInfo: ChainInfo;
  // evm
  address: Address | null;
  provider: EIP1193Provider | null;
  // auth
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const chainInfo: ChainInfo = {
  rpc: "https://rpc.testnet.osmosis.zone",
  rest: "https://lcd.testnet.osmosis.zone",
  chainId: "osmo-test-5",
  chainName: "Osmosis Testnet",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/chain.png",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "osmo",
    bech32PrefixAccPub: "osmopub",
    bech32PrefixValAddr: "osmovaloper",
    bech32PrefixValPub: "osmovaloperpub",
    bech32PrefixConsAddr: "osmovalcons",
    bech32PrefixConsPub: "osmovalconspub",
  },
  stakeCurrency: {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
    coinImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
  },
  currencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
    },
    {
      coinDenom: "ION",
      coinMinimalDenom: "uion",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uion.png",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/osmosis/uosmo.png",
      gasPriceStep: { low: 0.0025, average: 0.025, high: 0.04 },
    },
  ],
  features: [],
  isTestnet: true,
};

const OkoContext = createContext<OkoProviderValues>({
  isReady: false,
  isSignedIn: false,
  isSigningIn: false,
  publicKey: null,
  bech32Address: null,
  offlineSigner: null,
  chainInfo,
  address: null,
  provider: null,
  signIn: async () => {},
  signOut: async () => {},
});

function OkoProvider({ children }: { children: React.ReactNode }) {
  const [cosmosWallet, setCosmosWallet] =
    useState<CosmosEWalletInterface | null>(null);
  const [ethWallet, setEthWallet] = useState<EthEWalletInterface | null>(null);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);

  const [offlineSigner, setOfflineSigner] =
    useState<OfflineDirectSigner | null>(null);

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [publicKey, setPublicKey] = useState<Uint8Array | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  const bech32Address = publicKey
    ? getBech32Address(
        getCosmosAddress(publicKey),
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? "",
      )
    : null;

  async function init() {
    const apiKey = (import.meta as any).env.VITE_OKO_API_KEY ?? "";

    const cosmosInit = CosmosEWallet.init({ api_key: apiKey });
    const ethInit = EthEWallet.init({ api_key: apiKey, use_testnet: true });

    if (!cosmosInit.success) {
      console.error(cosmosInit.err);
      return;
    }
    if (!ethInit.success) {
      console.error(ethInit.err);
      return;
    }

    const c = cosmosInit.data;
    const e = ethInit.data;
    const p = e.getEthereumProvider();
    const signer = c.getOfflineSigner("osmo-test-5");

    try {
      const [pk, addr] = await Promise.all([
        c.getPublicKey().catch(() => null),
        e.getAddress().catch(() => null),
      ]);

      if (pk) {
        setPublicKey(pk);
      }
      if (addr) {
        setAddress(addr);
      }
      setIsSignedIn(!!pk || !!addr);
    } catch (err) {
      console.error(err);
      setIsSignedIn(false);
      setPublicKey(null);
      setAddress(null);
    } finally {
      setCosmosWallet(c);
      setEthWallet(e);
      setProvider(p);
      setOfflineSigner(signer);

      p.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      }).catch(console.error);
    }
  }

  async function signIn() {
    if (!cosmosWallet && !ethWallet) {
      return;
    }

    // sign-in via core eWallet (available from either instance)
    const eWallet = cosmosWallet?.eWallet ?? ethWallet?.eWallet;
    if (!eWallet) {
      return;
    }

    setIsSigningIn(true);

    try {
      await eWallet?.signIn("google");

      const [pk, addr] = await Promise.all([
        cosmosWallet?.getPublicKey().catch(() => null),
        ethWallet?.getAddress().catch(() => null),
      ]);

      if (pk) {
        setPublicKey(pk);
      }
      if (addr) {
        setAddress(addr);
      }
      setIsSignedIn(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    try {
      await (cosmosWallet?.eWallet ?? ethWallet?.eWallet)?.signOut();
    } finally {
      setIsSignedIn(false);
      setPublicKey(null);
      setAddress(null);
    }
  }

  useEffect(() => {
    init().catch(console.error);
  }, []);

  return (
    <OkoContext.Provider
      value={{
        isReady: !!cosmosWallet && !!ethWallet,
        isSignedIn,
        isSigningIn,
        publicKey,
        bech32Address,
        offlineSigner,
        chainInfo,
        address,
        provider,
        signIn,
        signOut,
      }}
    >
      {children}
    </OkoContext.Provider>
  );
}

export { OkoProvider, OkoContext };
