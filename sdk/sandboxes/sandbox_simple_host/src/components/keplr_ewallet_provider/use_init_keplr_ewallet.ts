import { useAppState } from "@/state";
import { useEffect, useState } from "react";

export function useInitKeplrEWallet() {
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useAppState.getState();

  useEffect(() => {
    async function fn() {
      try {
        const cosmosSDK = await appState.initKeplrSdkCosmos();

        if (!cosmosSDK) {
          console.error("cosmos ewallet not exists");

          return;
        }

        const isEthReady = await appState.initKeplrSdkEth();
        if (!isEthReady) {
          console.error("eth ewallet not exists");
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
