import { useEffect } from "react";

import { useAppState } from "@/state";

export function useInitKeplrEWallet() {
  const initKeplrSdkCosmos = useAppState((state) => state.initKeplrSdkCosmos);
  const initKeplrSdkEth = useAppState((state) => state.initKeplrSdkEth);
  const isInitialized = useAppState(
    (state) => state.keplr_sdk_cosmos !== null && state.keplr_sdk_eth !== null,
  );

  useEffect(() => {
    initKeplrSdkCosmos();
    initKeplrSdkEth();
  }, []);

  return { isInitialized };
}
