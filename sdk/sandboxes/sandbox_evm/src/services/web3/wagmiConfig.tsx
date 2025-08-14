import { Chain, createClient, fallback, getAddress, http, toHex } from "viem";
import { sepolia } from "viem/chains";
import { createConfig, CreateConnectorFn, createConnector } from "wagmi";
import {
  connectorsForWallets,
  WalletDetailsParams,
  Wallet,
} from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { keplrWallet } from "@keplr-wallet/rainbow-connector";
import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";
import {
  type EIP1193Provider,
  EthEWallet,
} from "@keplr-ewallet/ewallet-sdk-eth";

import { getAlchemyHttpUrl } from "@keplr-ewallet-sandbox-evm/utils/scaffold-eth";
import { keplrIcon } from "@keplr-ewallet-sandbox-evm/assets/icon";
import scaffoldConfig, {
  DEFAULT_ALCHEMY_API_KEY,
  ScaffoldConfig,
} from "@keplr-ewallet-sandbox-evm/../scaffold.config";
import { useAppState } from "@keplr-ewallet-sandbox-evm/services/store/app";

const { targetNetworks } = scaffoldConfig;

export const defaultWallets = [
  keplrWallet,
  metaMaskWallet,
  coinbaseWallet,
  toPrivyWallet({
    id: "cm04asygd041fmry9zmcyn5o5",
    name: "Abstract",
    iconUrl: "https://example.com/image.png",
  }),
];

export const enabledChains = targetNetworks.find(
  (network: Chain) => network.id === 11155111,
)
  ? targetNetworks
  : ([...targetNetworks, sepolia] as const);

export interface WalletConnectOptions {
  projectId: string;
}

const keplrEWalletConnector = (
  walletDetails: WalletDetailsParams,
  ethEWallet: EthEWallet,
): CreateConnectorFn => {
  let provider: EIP1193Provider | null = null;

  return createConnector((config) => {
    const wallet = {
      id: "keplr-ewallet",
      name: "Keplr E-Wallet",
      type: "keplr-ewallet" as const,
      icon: keplrIcon,
      connect: async () => {
        console.log("keplr-ewallet: try to connect keplr e-wallet!");

        const providerInstance = await wallet.getProvider();
        let accounts = await providerInstance.request({
          method: "eth_requestAccounts",
        });

        // if accounts is empty, try sign in
        if (accounts.length === 0) {
          console.log(
            "keplr-ewallet: no authenticated account, sign in with google",
          );
          await ethEWallet.eWallet.signIn("google");
        }

        const chainId = await providerInstance.request({
          method: "eth_chainId",
        });

        // re-request accounts, there should be at least one account after sign in
        accounts = await providerInstance.request({
          method: "eth_accounts",
        });

        console.log("keplr-ewallet: connected with accounts", accounts);

        return {
          accounts: accounts.map((x: string) => getAddress(x)),
          chainId: Number(chainId),
        };
      },
      disconnect: async () => {
        console.log("keplr-ewallet: disconnect");
        const providerInstance = await wallet.getProvider();
        providerInstance.removeListener(
          "accountsChanged",
          wallet.onAccountsChanged,
        );
        providerInstance.removeListener("chainChanged", wallet.onChainChanged);

        // CHECK: should sign out here?
      },
      getAccounts: async () => {
        console.log("keplr-ewallet: getAccounts");
        const providerInstance = await wallet.getProvider();
        return await providerInstance.request({
          method: "eth_accounts",
        });
      },
      getChainId: async () => {
        console.log("keplr-ewallet: getChainId");
        const providerInstance = await wallet.getProvider();
        const chainId = await providerInstance.request({
          method: "eth_chainId",
        });
        return Number(chainId);
      },
      getProvider: async (): Promise<EIP1193Provider> => {
        console.log("keplr-ewallet: getProvider");
        if (provider) {
          return provider;
        }

        provider = await ethEWallet.getEthereumProvider();

        provider.on("chainChanged", (chainId) => {
          wallet.onChainChanged(chainId);
        });

        provider.on("accountsChanged", (accounts) => {
          wallet.onAccountsChanged(accounts);
        });

        return provider;
      },
      isAuthorized: async () => {
        console.log("keplr-ewallet: isAuthorized");
        const accounts = await wallet.getAccounts();
        return !!accounts && accounts.length > 0;
      },
      switchChain: async ({ chainId }: { chainId: number }) => {
        console.log("keplr-ewallet: switchChain", chainId);
        const chain = targetNetworks.find((network) => network.id === chainId);
        if (!chain) {
          throw new Error(`Chain ${chainId} not found`);
        }

        const providerInstance = await wallet.getProvider();
        await providerInstance.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(chainId) }],
        });

        return chain;
      },
      onAccountsChanged: (accounts: string[]) => {
        if (accounts.length === 0) wallet.onDisconnect();
        else
          config.emitter.emit("change", {
            accounts: accounts.map((x: string) => getAddress(x)),
          });
      },
      onChainChanged: (chainId: string | number) => {
        const chainIdNumber = Number(chainId);
        config.emitter.emit("change", { chainId: chainIdNumber });
      },
      onDisconnect: () => {
        config.emitter.emit("disconnect");
      },
      ...walletDetails,
    };

    return wallet;
  });
};

export function keplrEWallet(eWallet: EthEWallet) {
  return (): Wallet => ({
    id: "keplr-ewallet",
    name: "Keplr E-Wallet",
    iconUrl: keplrIcon,
    shortName: "Keplr",
    rdns: "keplr-ewallet.com",
    iconBackground: "#0c2f78",
    downloadUrls: {
      android:
        "https://play.google.com/store/apps/details?id=com.chainapsis.keplr&pcampaignid=web_share",
      chrome:
        "https://chromewebstore.google.com/detail/dmkamcknogkgcdfhhbddcghachkejeap?utm_source=item-share-cb",
    },
    installed: true,
    createConnector: (walletDetails) => {
      return keplrEWalletConnector(walletDetails, eWallet);
    },
  });
}

export const wagmiConfigWithKeplr = () => {
  let wallets = [...defaultWallets];

  const ethEWallet = useAppState((state) => state.keplr_sdk_eth);

  if (ethEWallet) {
    wallets.unshift(keplrEWallet(ethEWallet));
  }

  return createConfig({
    chains: enabledChains,
    ssr: true,
    connectors: connectorsForWallets(
      [
        {
          groupName: "Supported Wallets",
          wallets,
        },
      ],
      {
        appName: "Sandbox EVM",
        projectId: scaffoldConfig.walletConnectProjectId,
      },
    ),
    client: ({ chain }) => {
      let rpcFallbacks = [http()];
      const rpcOverrideUrl = (
        scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"]
      )?.[chain.id];
      if (rpcOverrideUrl) {
        rpcFallbacks = [http(rpcOverrideUrl), http()];
      } else {
        const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
        if (alchemyHttpUrl) {
          const isUsingDefaultKey =
            scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
          rpcFallbacks = isUsingDefaultKey
            ? [http(), http(alchemyHttpUrl)]
            : [http(alchemyHttpUrl), http()];
        }
      }
      return createClient({
        chain,
        transport: fallback(rpcFallbacks),
        ...{ pollingInterval: scaffoldConfig.pollingInterval },
      });
    },
  });
};
