import { useContext } from "react";

import { KeplrEmbeddedContext } from "./KeplrEmbeddedProvider";

export default function useCosmos() {
  const ctx = useContext(KeplrEmbeddedContext);
  return {
    isReady: ctx.isReady,
    isSignedIn: ctx.isSignedIn,
    isSigningIn: ctx.isSigningIn,
    publicKey: ctx.publicKey,
    bech32Address: ctx.bech32Address,
    offlineSigner: ctx.offlineSigner,
    chainInfo: ctx.chainInfo,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
  };
}
