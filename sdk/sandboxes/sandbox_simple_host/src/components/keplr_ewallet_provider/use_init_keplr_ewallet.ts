import { useAppState } from "@/state";
import { useEffect, useState } from "react";

export function useInitKeplrEWallet() {
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useAppState.getState();

  useEffect(() => {
    async function fn() {
      try {
        const cosmosSDK = await appState.initKeplrSdkCosmos();
        console.log("[useInitKeplrEWallet] cosmosSDK", cosmosSDK);
        if (!cosmosSDK) {
          console.error("something wrong");
          return;
        }

        const isEthReady = await appState.initKeplrSdkEth();
        if (!isEthReady) {
          console.error("something wrong");
        }

        if (cosmosSDK && isEthReady) {
          setIsInitialized(true);
        }
      } catch (err: any) {
        console.error(err);
      }
    }

    fn().then();
  }, [setIsInitialized, appState]);

  return { isInitialized };
}
