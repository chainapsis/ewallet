import { useContext } from "react";

import { OkoEvmContext } from "@/components/OkoEvmProvider";

export default function useOkoEvm() {
  const {
    isReady,
    isSignedIn,
    isSigningIn,
    address,
    provider,
    signIn,
    signOut,
  } = useContext(OkoEvmContext);

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
