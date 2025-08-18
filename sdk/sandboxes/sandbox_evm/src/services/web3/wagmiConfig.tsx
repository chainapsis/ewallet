import { Chain, createClient, fallback, getAddress, http, toHex } from "viem";
import { sepolia } from "viem/chains";
import { createConfig, CreateConnectorFn, createConnector } from "wagmi";
import {
  connectorsForWallets,
  WalletDetailsParams,
  Wallet,
} from "@rainbow-me/rainbowkit";
import { coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";
import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";
import {
  initEthEWallet,
  type EIP1193Provider,
  type EthEWallet,
} from "@keplr-ewallet/ewallet-sdk-eth";

import { getAlchemyHttpUrl } from "@keplr-ewallet-sandbox-evm/utils/scaffold-eth";
import { keplrIcon } from "@keplr-ewallet-sandbox-evm/assets/icon";
import scaffoldConfig, {
  DEFAULT_ALCHEMY_API_KEY,
  ScaffoldConfig,
} from "@keplr-ewallet-sandbox-evm/../scaffold.config";

const { targetNetworks } = scaffoldConfig;

const keplrEWallet = (): Wallet => ({
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
  createConnector: keplrEWalletConnector,
});

export const defaultWallets = [
  keplrEWallet,
  coinbaseWallet,
  toPrivyWallet({
    id: "cm04asygd041fmry9zmcyn5o5",
    name: "Abstract",
    iconUrl: "https://example.com/image.png",
  }),
];

export interface WalletConnectOptions {
  projectId: string;
}

function keplrEWalletConnector(
  walletDetails: WalletDetailsParams,
): CreateConnectorFn {
  let initPromise: Promise<EthEWallet> | null = null;

  let ethEWallet: EthEWallet | null = null;
  let cachedProvider: EIP1193Provider | null = null;

  const ensureInit = () => {
    if (!initPromise) {
      initPromise = (async () => {
        console.log("keplr-ewallet: setup");

        // TODO: enable to override chain info when init ethereum wallet
        const initRes = await initEthEWallet({
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
        });
        if (!initRes.success) {
          throw new Error(`init fail: ${initRes.err}`);
        }
        console.log("keplr-ewallet: eth sdk init success");
        ethEWallet = initRes.data;
        return initRes.data;
      })();
    }
    return initPromise;
  };

  return createConnector<EIP1193Provider>((config) => {
    const wallet = {
      id: "keplr-ewallet",
      name: "Keplr E-Wallet",
      type: "keplr-ewallet" as const,
      icon: keplrIcon,
      setup: async () => {
        await ensureInit();
      },
      connect: async (parameters?: {
        chainId?: number | undefined;
        isReconnecting?: boolean | undefined;
      }) => {
        console.log("[sandbox-evm] try to connect keplr e-wallet!");

        const ethEWallet = await ensureInit();

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

          console.log(
            "[sandbox-evm] no authenticated account, sign in with google",
          );
          await ethEWallet.eWallet.signIn("google");
        }

        const chainId = await wallet.getChainId();

        if (parameters?.chainId && chainId !== parameters.chainId) {
          await wallet.switchChain({ chainId: parameters.chainId });
        }

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

        await ethEWallet?.eWallet.signOut();
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

        const ethEWallet = await ensureInit();

        cachedProvider = await ethEWallet.getEthereumProvider();

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
    ssr: true,
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
