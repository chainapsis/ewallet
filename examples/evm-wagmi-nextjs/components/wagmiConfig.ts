import { createClient, getAddress, http, toHex, type Address } from "viem";
import { createConfig, CreateConnectorFn, createConnector } from "wagmi";
import {
  connectorsForWallets,
  WalletDetailsParams,
  Wallet,
} from "@rainbow-me/rainbowkit";
import {
  type EthEWalletInitArgs,
  EthEWalletInterface,
  EWalletEIP1193Provider,
} from "@keplr-ewallet/ewallet-sdk-eth";
import { sepolia } from "viem/chains";

import keplrIcon from "@/public/icon.png";

export const defaultWallets = [
  toKeplrEmbedded({
    api_key: process.env.NEXT_PUBLIC_KEPLR_EMBEDDED_API_KEY ?? "",
    use_testnet: true,
  }),
];

function toKeplrEmbedded(args: EthEWalletInitArgs): () => Wallet {
  return () => ({
    id: "keplr-embedded",
    name: "Keplr Embedded",
    iconUrl: keplrIcon.src,
    shortName: "Keplr",
    rdns: "embed.keplr.app",
    iconBackground: "#0c2f78",
    installed: true,
    createConnector: (walletDetails) =>
      keplrEmbeddedConnector(walletDetails, args),
  });
}

export interface WalletConnectOptions {
  projectId: string;
}

function keplrEmbeddedConnector(
  walletDetails: WalletDetailsParams,
  args: EthEWalletInitArgs,
): CreateConnectorFn {
  let ethEWallet: EthEWalletInterface | null = null;
  let cachedProvider: EWalletEIP1193Provider | null = null;

  async function initEthEWalletOnce(): Promise<EthEWalletInterface> {
    if (ethEWallet) {
      return ethEWallet;
    }

    const { EthEWallet } = await import("@keplr-ewallet/ewallet-sdk-eth");
    const initRes = EthEWallet.init(args);

    if (!initRes.success) {
      throw new Error(`init fail: ${initRes.err}`);
    }

    // NOTE: order matters, wait until initialized before setting ethEWallet
    await initRes.data.waitUntilInitialized;

    ethEWallet = initRes.data;

    return ethEWallet;
  }

  return createConnector<EWalletEIP1193Provider>((config) => {
    const wallet = {
      id: "keplr-embedded",
      name: "Keplr Embedded",
      type: "keplr-embedded" as const,
      icon: keplrIcon.src,
      setup: async () => {
        // Only setup in browser environment
        if (typeof window !== "undefined") {
          await initEthEWalletOnce();
        } else {
          console.log("keplr embedded can only be initialized in browser");
        }
      },
      connect: async <WithCapabilities extends boolean = false>(parameters?: {
        chainId?: number | undefined;
        isReconnecting?: boolean | undefined;
        withCapabilities?: WithCapabilities | boolean | undefined;
      }) => {
        if (!ethEWallet) {
          await initEthEWalletOnce();

          // DO NOT fallthrough here to manually retry connect
          // as popup on safari will be blocked by async initialization
          throw new Error("keplr e-wallet just initialized");
        }

        let accounts = await wallet.getAccounts();

        if (accounts.length === 0) {
          if (parameters?.isReconnecting) {
            return {
              accounts: accounts as unknown as WithCapabilities extends true
                ? readonly {
                    address: Address;
                    capabilities: Record<string, unknown>;
                  }[]
                : readonly Address[],
              chainId: await wallet.getChainId(),
            };
          }

          await ethEWallet.eWallet.signIn("google");
        }

        const chainId = await wallet.getChainId();

        accounts = await wallet.getAccounts();

        return {
          accounts: accounts as unknown as WithCapabilities extends true
            ? readonly {
                address: Address;
                capabilities: Record<string, unknown>;
              }[]
            : readonly Address[],
          chainId,
        };
      },
      disconnect: async () => {
        const provider = await wallet.getProvider();
        provider.removeListener("accountsChanged", wallet.onAccountsChanged);
        provider.removeListener("chainChanged", wallet.onChainChanged);

        if (ethEWallet) {
          await ethEWallet.eWallet.signOut();
        }
      },
      getAccounts: async () => {
        const provider = await wallet.getProvider();
        const accounts = await provider.request({
          method: "eth_accounts",
        });
        return accounts.map((x: string) => getAddress(x));
      },
      getChainId: async () => {
        const provider = await wallet.getProvider();
        const chainId = await provider.request({
          method: "eth_chainId",
        });
        return Number(chainId);
      },
      getProvider: async () => {
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
        const accounts = await wallet.getAccounts();
        return accounts.length > 0;
      },
      switchChain: async ({ chainId }: { chainId: number }) => {
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

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: connectorsForWallets(
    [
      {
        groupName: "Supported Wallets",
        wallets: defaultWallets,
      },
    ],
    {
      appName: "Keplr Embedded EVM Wagmi Template",
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
    },
  ),
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
