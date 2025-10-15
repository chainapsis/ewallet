import { useContext } from "react";

import { KeplrEmbeddedContext } from "@/components/KeplrEmbeddedProvider";

export default function useKeplrEmbedded() {
  const {
    isReady,
    isSignedIn,
    isSigningIn,
    address,
    provider,
    signIn,
    signOut,
  } = useContext(KeplrEmbeddedContext);

  return {
    isReady,
    isSignedIn,
    isSigningIn,
    address,
    provider,
    signIn,
    signOut,
  };
}
