"use client";

import { usePermit } from "@keplr-ewallet-sandbox-evm/hooks/scaffold-eth/usePermit";

export function SigningPlayground() {
  const { signPermit, signature, error } = usePermit({});

  return <div>Signing Playground</div>;
}
