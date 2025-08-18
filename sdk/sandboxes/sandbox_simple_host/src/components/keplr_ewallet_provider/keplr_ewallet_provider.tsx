"use client";

import React, { type PropsWithChildren } from "react";
import { useInitKeplrEWallet } from "./use_init_keplr_ewallet";

export const KeplrEWalletProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isInitialized } = useInitKeplrEWallet();

  return (
    <div>
      <p>checking {isInitialized ? "true" : "false"}</p>
      {isInitialized && <>{children}</>}
    </div>
  );
};
