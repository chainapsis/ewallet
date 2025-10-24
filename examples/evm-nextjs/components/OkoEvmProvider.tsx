import { createContext, useEffect, useState } from "react";
import {
  EIP1193Provider,
  EthEWallet,
  type EthEWalletInterface,
} from "@oko-wallet/oko-sdk-eth";
import { Address } from "viem";

interface OkoEvmProviderValues {
  isReady: boolean;
  isSignedIn: boolean;
  isSigningIn: boolean;
  address: Address | null;
  provider: EIP1193Provider | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const OkoEvmContext = createContext<OkoEvmProviderValues>({
  isReady: false,
  isSignedIn: false,
  isSigningIn: false,
  address: null,
  provider: null,
  signIn: async () => {},
  signOut: async () => {},
});

function OkoEvmProvider({ children }: { children: React.ReactNode }) {
  const [ethEWallet, setEthEWallet] = useState<EthEWalletInterface | null>(
    null,
  );
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);

  async function initOkoEvm() {
    const okoEvm = EthEWallet.init({
      api_key: process.env.NEXT_PUBLIC_OKO_API_KEY ?? "",
      use_testnet: true,
    });

    if (!okoEvm.success) {
      console.error(okoEvm.err);
      return;
    }

    const ethEWallet = okoEvm.data;
    const provider = ethEWallet.getEthereumProvider();

    try {
      const address = await ethEWallet.getAddress();

      setAddress(address);
      setIsSignedIn(true);
    } catch (error) {
      // sign in required
      console.error(error);
      setIsSignedIn(false);
      setAddress(null);
    } finally {
      setEthEWallet(ethEWallet);
      setProvider(provider);

      // switch to ethereum sepolia as initial chain id is set to 1
      provider
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        })
        .catch(console.error);
    }
  }

  async function signIn() {
    if (!ethEWallet) {
      return;
    }

    setIsSigningIn(true);

    try {
      await ethEWallet.eWallet.signIn("google");

      const address = await ethEWallet.getAddress();

      setIsSignedIn(true);
      setAddress(address);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    await ethEWallet?.eWallet.signOut();
    setIsSignedIn(false);
    setAddress(null);
  }

  useEffect(() => {
    initOkoEvm().catch(console.error);
  }, []);

  return (
    <OkoEvmContext.Provider
      value={{
        isReady: !!ethEWallet,
        isSignedIn,
        isSigningIn,
        address,
        provider,
        signIn,
        signOut,
      }}
    >
      {children}
    </OkoEvmContext.Provider>
  );
}

export { OkoEvmProvider, OkoEvmContext };
