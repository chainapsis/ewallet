import { useContext } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

import { KeplrEmbeddedContext } from "./KeplrEmbeddedProvider";

export default function useEvm() {
  const ctx = useContext(KeplrEmbeddedContext);
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  return {
    isReady: ctx.isReady,
    isSignedIn: ctx.isSignedIn,
    isSigningIn: ctx.isSigningIn,
    address: ctx.address,
    provider: ctx.provider,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
    publicClient,
  };
}
