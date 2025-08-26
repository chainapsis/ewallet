import { useSDKState } from "@/state/sdk";
import { useEffect, useState } from "react";

export function useIsSignedIn() {
  const cosmosSDK = useSDKState((state) => state.keplr_sdk_cosmos);
  const [email, setEmail] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const handleAccountsChanged = (
      payload: { email: string; publicKey: string } | {},
    ) => {
      console.log("[demo-web] accountsChanged payload:", payload);

      if ("email" in payload) {
        setEmail(payload.email || null);
        setPublicKey(payload.publicKey || null);
      } else {
        setEmail(null);
        setPublicKey(null);
      }
    };

    async function fn() {
      try {
        if (cosmosSDK) {
          const [email, publicKey] = await Promise.all([
            cosmosSDK.eWallet.getEmail(),
            cosmosSDK.eWallet.getPublicKey(),
          ]);
          setEmail(email);
          setPublicKey(publicKey);

          cosmosSDK.on({
            type: "accountsChanged",
            handler: handleAccountsChanged,
          });
        }
      } catch (err) {
        console.error("[demo-web] Failed to load initial state:", err);
      }
    }

    fn().then();

    return () => {
      if (cosmosSDK) {
        // cosmosSDK.off("accountsChanged", handleAccountsChanged);
      }
    };
  }, [cosmosSDK]);

  return {
    isSignedIn: !!email && !!publicKey,
    email,
    publicKey,
  };
}

export function useAddresses() {
  const cosmosSDK = useSDKState((state) => state.keplr_sdk_cosmos);
  const ethSDK = useSDKState((state) => state.keplr_sdk_eth);

  const { isSignedIn } = useIsSignedIn();

  const [cosmosAddress, setCosmosAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const promises = [];

        if (cosmosSDK) {
          promises.push(
            cosmosSDK
              .getKey("cosmoshub-4")
              .then((key) => setCosmosAddress(key?.bech32Address || null)),
          );
        }

        if (ethSDK) {
          promises.push(
            ethSDK.getAddress().then((addr) => setEthAddress(addr)),
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    };

    if (isSignedIn) {
      loadAddresses();
    }

    if (!isSignedIn) {
      if (cosmosAddress) {
        setCosmosAddress(null);
      }

      if (ethAddress) {
        setEthAddress(null);
      }
    }
  }, [isSignedIn, cosmosSDK, ethSDK]);

  return { cosmosAddress, ethAddress };
}
