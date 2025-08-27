import { useEffect } from "react";

import { useSDKState } from "@/state/sdk";
import { useUserInfoState } from "@/state/userInfo";

function setupCosmosListener() {
  const cosmosSDK = useSDKState.getState().keplr_sdk_cosmos;
  const setUserInfo = useUserInfoState.getState().setUserInfo;

  if (cosmosSDK) {
    cosmosSDK.on({
      type: "accountsChanged",
      handler: ({ email, publicKey }) => {
        setUserInfo({
          email: email || null,
          publicKey: publicKey ? Buffer.from(publicKey).toString("hex") : null,
        });
      },
    });
  }
}

export function useInitKeplrEWallet() {
  const initKeplrSdkCosmos = useSDKState((state) => state.initKeplrSdkCosmos);
  const initKeplrSdkEth = useSDKState((state) => state.initKeplrSdkEth);

  const isInitialized = useSDKState(
    (state) => state.keplr_sdk_cosmos !== null && state.keplr_sdk_eth !== null,
  );

  useEffect(() => {
    initKeplrSdkCosmos();
    initKeplrSdkEth();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setupCosmosListener();
    }
  }, [isInitialized]);

  return { isInitialized };
}
