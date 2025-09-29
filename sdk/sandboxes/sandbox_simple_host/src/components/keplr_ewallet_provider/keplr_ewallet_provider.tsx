"use client";

import { type FC, type PropsWithChildren } from "react";

import { useInitKeplrEWallet } from "./use_init_keplr_ewallet";
import { Skeleton } from "@/components/skeleton/skeleton";

export const KeplrEWalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isInitialized } = useInitKeplrEWallet();

  return (
    <div>
      <p>isInitialized {isInitialized ? "true" : "false"}</p>

      <p>Animation check</p>
      <Skeleton width="100px" height="100px" borderRadius="20px" />

      {isInitialized && <>{children}</>}
    </div>
  );
};
