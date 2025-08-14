import { EthEWallet, initEthEWallet } from "@keplr-ewallet/ewallet-sdk-eth";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

const STORAGE_KEY = "ewallet-sandbox-evm";

interface AppState {
  keplr_sdk_eth: EthEWallet | null;
}

interface AppActions {
  initKeplrSdkEth: () => Promise<EthEWallet | null>;
}

export const useAppState = create(
  persist(
    combine<AppState, AppActions>(
      {
        keplr_sdk_eth: null,
      },
      (set) => ({
        initKeplrSdkEth: async () => {
          try {
            const initRes = await initEthEWallet({
              api_key:
                "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
              sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
            });

            let ethEWallet;
            if (initRes.success) {
              ethEWallet = initRes.data;
            } else {
              console.error("eth sdk init fail, err: %s", initRes.err);

              return null;
            }

            set({ keplr_sdk_eth: ethEWallet });
            return ethEWallet;
          } catch (err: any) {
            console.error("eth sdk init fail, err: %s", err);

            return null;
          }
        },
      }),
    ),
    { name: STORAGE_KEY },
  ),
);
