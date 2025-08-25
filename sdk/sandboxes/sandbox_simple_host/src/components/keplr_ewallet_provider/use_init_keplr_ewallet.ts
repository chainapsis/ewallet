import { useEffect } from "react";

import { useAppState } from "@/state";

export function useInitKeplrEWallet() {
  const initKeplrSdkCosmos = useAppState((state) => state.initKeplrSdkCosmos);
  const initKeplrSdkEth = useAppState((state) => state.initKeplrSdkEth);
  const isInitialized = useAppState((state) => state.isInitialized);

  useEffect(() => {
    initKeplrSdkCosmos();
    initKeplrSdkEth();
  }, []);

  return { isInitialized };
}
