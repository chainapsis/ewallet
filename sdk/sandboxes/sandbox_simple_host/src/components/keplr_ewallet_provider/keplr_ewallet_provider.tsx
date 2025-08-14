"use client";

import { useAppState } from "@/state";
import React, { useEffect, useState, type PropsWithChildren } from "react";

export const KeplrEWalletProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useAppState.getState();

  useEffect(() => {
    async function fn() {
      try {
        const cosmosSDK = await appState.initKeplrSdkCosmos();
        if (!cosmosSDK) {
          console.error("something wrong");
        }

        // cosmosSDK.on("", () => { });

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

  return (
    <div>
      <p>checking {isInitialized ? "true" : "false"}</p>
      {isInitialized && <>{children}</>}
    </div>
  );
};
