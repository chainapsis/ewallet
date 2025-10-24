import { createContext, useEffect, useState } from "react";
import {
  CosmosEWallet,
  getBech32Address,
  getCosmosAddress,
  type CosmosEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-cosmos";
import { ChainInfo } from "@keplr-wallet/types";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";

interface OkoCosmosProviderValues {
  isReady: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  publicKey: Uint8Array | null;
  bech32Address: string | null;
  offlineSigner: OfflineDirectSigner | null;
  chainInfo: ChainInfo;
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
  bip44: {
    coinType: 118,
  },
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
      gasPriceStep: {
        low: 0.0025,
        average: 0.025,
        high: 0.04,
      },
    },
  ],
  features: [],
  isTestnet: true,
};

const OkoCosmosContext = createContext<OkoCosmosProviderValues>({
  isReady: false,
  isSignedIn: false,
  isSigningIn: false,
  publicKey: null,
  bech32Address: null,
  offlineSigner: null,
  chainInfo,
  signIn: async () => {},
  signOut: async () => {},
});

function OkoCosmosProvider({ children }: { children: React.ReactNode }) {
  const [cosmosEWallet, setCosmosEWallet] =
    useState<CosmosEWalletInterface | null>(null);
  const [offlineSigner, setOfflineSigner] =
    useState<OfflineDirectSigner | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [publicKey, setPublicKey] = useState<Uint8Array | null>(null);

  const bech32Address = publicKey
    ? getBech32Address(
        getCosmosAddress(publicKey),
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? "",
      )
    : null;

  async function initOkoCosmos() {
    const okoCosmos = CosmosEWallet.init({
      api_key: process.env.NEXT_PUBLIC_OKO_API_KEY ?? "",
    });

    if (!okoCosmos.success) {
      console.error(okoCosmos.err);
      return;
    }

    const cosmosEWallet = okoCosmos.data;
    const offlineSigner = cosmosEWallet.getOfflineSigner("osmo-test-5");

    try {
      const publicKey = await cosmosEWallet.getPublicKey();

      setPublicKey(publicKey);
      setIsSignedIn(true);
    } catch (error) {
      // sign in required
      console.error(error);
      setIsSignedIn(false);
      setPublicKey(null);
    } finally {
      setCosmosEWallet(cosmosEWallet);
      setOfflineSigner(offlineSigner);
    }
  }

  async function signIn() {
    if (!cosmosEWallet) {
      return;
    }

    setIsSigningIn(true);

    try {
      await cosmosEWallet.eWallet.signIn("google");

      const publicKey = await cosmosEWallet.getPublicKey();

      setIsSignedIn(true);
      setPublicKey(publicKey);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    await cosmosEWallet?.eWallet.signOut();
    setIsSignedIn(false);
    setPublicKey(null);
  }

  useEffect(() => {
    initOkoCosmos().catch(console.error);
  }, []);

  return (
    <OkoCosmosContext.Provider
      value={{
        isReady: !!cosmosEWallet,
        isSignedIn,
        isSigningIn,
        publicKey,
        bech32Address,
        offlineSigner,
        chainInfo,
        signIn,
        signOut,
      }}
    >
      {children}
    </OkoCosmosContext.Provider>
  );
}

export { OkoCosmosProvider, OkoCosmosContext };
