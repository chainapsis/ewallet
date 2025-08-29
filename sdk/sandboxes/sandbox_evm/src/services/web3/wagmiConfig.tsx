"use client";

import { createClient, fallback, getAddress, http, toHex } from "viem";
import { createConfig, CreateConnectorFn, createConnector } from "wagmi";
import {
  connectorsForWallets,
  WalletDetailsParams,
  Wallet,
} from "@rainbow-me/rainbowkit";
import { coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";
import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";
import type {
  EthEWalletInitArgs,
  EthEWalletInterface,
  EWalletEIP1193Provider,
} from "@keplr-ewallet/ewallet-sdk-eth";

import { getAlchemyHttpUrl } from "@keplr-ewallet-sandbox-evm/utils/scaffold-eth";
import { keplrIcon } from "@keplr-ewallet-sandbox-evm/assets/icon";
import scaffoldConfig, {
  DEFAULT_ALCHEMY_API_KEY,
  ScaffoldConfig,
} from "@keplr-ewallet-sandbox-evm/../scaffold.config";

const { targetNetworks } = scaffoldConfig;

export const defaultWallets = [
  toKeplrEWallet({
    api_key: "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
    sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
    use_testnet: true,
  }),
  coinbaseWallet,
  toPrivyWallet({
    id: "cm04asygd041fmry9zmcyn5o5",
    name: "Abstract",
    iconUrl: "https://example.com/image.png",
  }),
];

function toKeplrEWallet(args: EthEWalletInitArgs): () => Wallet {
  return () => ({
    id: "keplr-ewallet",
    name: "Keplr Embedded",
    iconUrl: keplrIcon,
    shortName: "Keplr",
    rdns: "embed.keplr.app",
    iconBackground: "#0c2f78",
    installed: true,
    createConnector: (walletDetails) =>
      keplrEWalletConnector(walletDetails, args),
  });
}

export interface WalletConnectOptions {
  projectId: string;
}

// wagmi compatible connector for keplr e-wallet
function keplrEWalletConnector(
  walletDetails: WalletDetailsParams,
  args: EthEWalletInitArgs,
): CreateConnectorFn {
  let ethEWallet: EthEWalletInterface | null = null;
  let cachedProvider: EWalletEIP1193Provider | null = null;

  async function initEthEWalletOnce(): Promise<EthEWalletInterface> {
    if (ethEWallet) {
      return ethEWallet;
    }

    // lazy import to avoid SSR issues and optimize bundle size
    const { EthEWallet } = await import("@keplr-ewallet/ewallet-sdk-eth");
    const initRes = await EthEWallet.initAsync(args);

    if (!initRes.success) {
      throw new Error(`init fail: ${initRes.err}`);
    }

    ethEWallet = initRes.data;
    return ethEWallet;
  }

  return createConnector<EWalletEIP1193Provider>((config) => {
    const wallet = {
      id: "keplr-ewallet",
      name: "Keplr Embedded",
      type: "keplr-ewallet" as const,
      icon: keplrIcon,
      setup: async () => {
        console.log("[sandbox-evm] setup keplr e-wallet");
        // Only setup in browser environment
        if (typeof window !== "undefined") {
          console.log("[sandbox-evm] setup keplr e-wallet in browser");
          await initEthEWalletOnce();
        } else {
          console.log(
            "[sandbox-evm] keplr e-wallet can only be initialized in browser",
          );
        }
      },
      connect: async (parameters?: {
        chainId?: number | undefined;
        isReconnecting?: boolean | undefined;
      }) => {
        console.log("[sandbox-evm] try to connect keplr e-wallet!");

        if (!ethEWallet) {
          await initEthEWalletOnce();

          // DO NOT fallthrough here to manually retry connect
          // as popup on safari will be blocked by async initialization
          throw new Error("keplr e-wallet just initialized");
        }

        // cached accounts retrieved from provider
        let accounts = await wallet.getAccounts();

        // if accounts is empty, try sign in
        if (accounts.length === 0) {
          // if is reconnecting, skip sign in with google
          // only trigger by user manually interact with the connector
          if (parameters?.isReconnecting) {
            console.log(
              "[sandbox-evm] reconnecting ewallet, skip sign in with google",
            );
            return {
              accounts,
              chainId: await wallet.getChainId(),
            };
          }

          // popup on safari works fine here as we use cached states
          console.log(
            "[sandbox-evm] no authenticated account, sign in with google",
          );
          await ethEWallet.eWallet.signIn("google");
        }

        const chainId = await wallet.getChainId();

        // TODO: after enable to override chain info
        // if (parameters?.chainId && chainId !== parameters.chainId) {
        //   await wallet.switchChain({ chainId: parameters.chainId });
        // }

        // re-request accounts, there should be at least one account after sign in
        accounts = await wallet.getAccounts();

        console.log(
          "[sandbox-evm] connected with accounts ",
          accounts.length > 0,
        );

        return {
          accounts,
          chainId,
        };
      },
      disconnect: async () => {
        console.log("[sandbox-evm] disconnect keplr e-wallet");
        const provider = await wallet.getProvider();
        provider.removeListener("accountsChanged", wallet.onAccountsChanged);
        provider.removeListener("chainChanged", wallet.onChainChanged);
      },
      getAccounts: async () => {
        console.log("[sandbox-evm] handle `getAccounts`");
        const provider = await wallet.getProvider();
        const accounts = await provider.request({
          method: "eth_accounts",
        });
        return accounts.map((x: string) => getAddress(x));
      },
      getChainId: async () => {
        console.log("[sandbox-evm] handle `getChainId`");

        const provider = await wallet.getProvider();
        const chainId = await provider.request({
          method: "eth_chainId",
        });
        return Number(chainId);
      },
      getProvider: async () => {
        console.log("[sandbox-evm] handle `getProvider`");
        if (cachedProvider) {
          return cachedProvider;
        }

        const ethEWallet = await initEthEWalletOnce();

        cachedProvider = ethEWallet.getEthereumProvider();

        cachedProvider.on("chainChanged", (chainId) => {
          wallet.onChainChanged(chainId);
        });

        cachedProvider.on("accountsChanged", (accounts) => {
          wallet.onAccountsChanged(accounts);
        });

        return cachedProvider;
      },
      isAuthorized: async () => {
        console.log("[sandbox-evm] handle `isAuthorized`");
        const accounts = await wallet.getAccounts();
        return accounts.length > 0;
      },
      switchChain: async ({ chainId }: { chainId: number }) => {
        console.log("[sandbox-evm] handle `switchChain`", chainId);
        const chain = config.chains.find((network) => network.id === chainId);
        if (!chain) {
          throw new Error(`Chain ${chainId} not found`);
        }

        const provider = await wallet.getProvider();
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHex(chainId) }],
        });

        return chain;
      },
      onAccountsChanged: (accounts: string[]) => {
        if (accounts.length === 0) {
          wallet.onDisconnect();
        } else {
          config.emitter.emit("change", {
            accounts: accounts.map((x: string) => getAddress(x)),
          });
        }
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
}

export const wagmiConfigWithKeplr = () => {
  return createConfig({
    chains: [targetNetworks[0], ...targetNetworks.slice(1)],
    ssr: true, // in server side, it won't be able to initialize keplr e-wallet
    connectors: connectorsForWallets(
      [
        {
          groupName: "Supported Wallets",
          wallets: defaultWallets,
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
