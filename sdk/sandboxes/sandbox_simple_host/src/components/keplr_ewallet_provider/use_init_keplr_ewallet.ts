import { useAppState } from "@/state";
import { useEffect, useState } from "react";

export function useInitKeplrEWallet() {
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useAppState.getState();

  useEffect(() => {
    async function fn() {
      try {
        const cosmosSDK = appState.initKeplrSdkCosmos();
        const isEthReady = appState.initKeplrSdkEth();

        if (cosmosSDK && isEthReady) {
          const pk = await cosmosSDK.getPublicKey();
          console.log(22, pk);

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
