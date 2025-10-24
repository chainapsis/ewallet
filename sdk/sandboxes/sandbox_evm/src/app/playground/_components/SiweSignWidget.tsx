"use client";

import { useAccount, useChainId, useWalletClient } from "wagmi";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { useState } from "react";

import { useSignMessage } from "@oko-wallet-sandbox-evm/hooks/scaffold-eth";

export function SiweSignWidget() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { signMessage, signature, isLoading, error, reset } = useSignMessage();

  const [signedMessage, setSignedMessage] = useState("");

  const handleSiweSign = async () => {
    if (!walletClient || !address || !chainId) {
      return;
    }

    const siweMessage = createSiweMessage({
      domain: "oko-wallet-sandbox.vercel.app",
      uri: "https://oko-wallet-sandbox.vercel.app",
      address,
      chainId,
      nonce: generateSiweNonce(),
      version: "1",
      statement:
        "Sign in with Ethereum to the app. This is a test message for the sandbox.",
    });

    await signMessage(walletClient, siweMessage);
    setSignedMessage(siweMessage);
  };

  const copySignature = async () => {
    if (!signature) return;
    try {
      await navigator.clipboard.writeText(signature);
    } catch { }
  };

  const copyMessage = async () => {
    if (!signedMessage) return;
    try {
      await navigator.clipboard.writeText(signedMessage);
    } catch { }
  };

  const resetSiweSign = () => {
    reset();
    setSignedMessage("");
  };

  return (
    <div className="card bg-base-100 shadow-xl h-fit">
      <div className="card-body">
        <h2 className="card-title">Sign-In with Ethereum (SIWE)</h2>
        <p className="text-sm text-base-content/70">
          Test Sign-In with Ethereum message signing. This allows you to sign
          structured authentication messages that follow the ERC-4361 standard.
        </p>

        <button
          onClick={handleSiweSign}
          disabled={!walletClient || !address || !chainId || isLoading}
          className="btn btn-primary w-full mt-4"
        >
          {isLoading ? "Signing..." : "Sign SIWE Message"}
        </button>

        {error && (
          <div className="alert alert-error mt-4">
            <span className="text-sm">{error?.message}</span>
          </div>
        )}

        {signature && signedMessage && (
          <div className="alert alert-success flex flex-col items-start gap-2 mt-4">
            <div className="font-medium">SIWE Signature Generated</div>
            <div className="bg-base-200 rounded p-3 w-full max-h-40 overflow-x-auto overflow-y-auto">
              <code className="text-xs whitespace-pre font-mono text-base-content">
                {signature}
              </code>
            </div>
            <div className="w-full">
              <div className="text-sm font-medium mb-2">Signed Message:</div>
              <div className="bg-base-200 rounded p-3 w-full max-h-40 overflow-x-auto overflow-y-auto">
                <code className="text-xs whitespace-pre font-mono text-base-content">
                  {signedMessage}
                </code>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copySignature}
                className="btn btn-xs btn-outline"
              >
                Copy Signature
              </button>
              <button onClick={copyMessage} className="btn btn-xs btn-outline">
                Copy Message
              </button>
              <button onClick={resetSiweSign} className="btn btn-xs btn-ghost">
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
