"use client";

import { useAppState } from "@/state";

export const useKeplrEwallet = () => {
  const cosmosEWallet = useAppState((state) => state.keplr_sdk_cosmos);
  const ethEWallet = useAppState((state) => state.keplr_sdk_eth);

  // console.log(11, cosmosEWallet?.eWallet, ethEWallet?.eWallet);

  return {
    cosmosEWallet,
    ethEWallet,
  };
};
