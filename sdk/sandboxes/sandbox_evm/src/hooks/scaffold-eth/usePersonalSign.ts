import { useState } from "react";
import { Hex, WalletClient } from "viem";

export function usePersonalSign() {
  const [signature, setSignature] = useState<Hex | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signPersonalMessage = async (
    walletClient: WalletClient,
    message: string,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!walletClient.account?.address) {
        throw new Error("No account connected");
      }

      // Convert message to hex if it's not already
      const messageHex = message.startsWith("0x")
        ? message
        : `0x${Buffer.from(message, "utf8").toString("hex")}`;

      const signature = await walletClient.signMessage({
        account: walletClient.account.address,
        message: messageHex,
      });

      setSignature(signature);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Personal signing failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signPersonalMessage,
    signature,
    isLoading,
    error,
    reset: () => {
      setSignature(null);
      setError(null);
    },
  };
}
