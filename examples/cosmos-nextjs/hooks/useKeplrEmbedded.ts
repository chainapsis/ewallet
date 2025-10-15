import { useContext } from "react";

import { KeplrEmbeddedContext } from "@/components/KeplrEmbeddedProvider";

export default function useKeplrEmbedded() {
  const {
    isReady,
    isSignedIn,
    isSigningIn,
    publicKey,
    offlineSigner,
    chainInfo,
    bech32Address,
    signIn,
    signOut,
  } = useContext(KeplrEmbeddedContext);

  return {
    isReady,
    isSignedIn,
    isSigningIn,
    publicKey,
    offlineSigner,
    chainInfo,
    bech32Address,
    signIn,
    signOut,
  };
}
