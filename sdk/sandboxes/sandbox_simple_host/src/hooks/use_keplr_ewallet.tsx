"use client";

import { useSDKState } from "@/state/sdk";

export const useKeplrEwallet = () => {
  const cosmosEWallet = useSDKState((state) => state.keplr_sdk_cosmos);
  const ethEWallet = useSDKState((state) => state.keplr_sdk_eth);

  return {
    cosmosEWallet,
    ethEWallet,
  };
};
