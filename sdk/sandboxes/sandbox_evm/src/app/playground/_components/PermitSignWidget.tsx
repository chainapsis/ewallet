"use client";

import { useState } from "react";
import { Address, Hex } from "viem";
import { useAccount, useWalletClient, useChainId } from "wagmi";

import { usePermit } from "@keplr-ewallet-sandbox-evm/hooks/scaffold-eth/usePermit";
import {
  AddressInput,
  IntegerInput,
} from "@keplr-ewallet-sandbox-evm/components/scaffold-eth/Input";

export function PermitSignWidget() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [permitContractAddress, setPermitContractAddress] =
    useState<Address>("0x");
  const [permitSpenderAddress, setPermitSpenderAddress] =
    useState<Address>("0x");
  const [permitValue, setPermitValue] = useState("0");
  const [permitDeadline, setPermitDeadline] = useState("");
  const [isPermitSigning, setIsPermitSigning] = useState(false);

  const {
    signPermit,
    signature: permitSignature,
    error: permitError,
    name,
    version,
    nonce,
  } = usePermit({
    contractAddress: permitContractAddress as Hex,
    chainId: Number(chainId),
    spenderAddress: permitSpenderAddress as Hex,
  });

  const handlePermitSign = async () => {
    if (!walletClient || !address) return;
    try {
      setIsPermitSigning(true);
      const deadlineSeconds = permitDeadline.trim()
        ? Number(permitDeadline)
        : Math.floor(Date.now() / 1000) + 3600;
      const deadline = BigInt(deadlineSeconds);
      const value = BigInt(permitValue || "0");
      await signPermit?.({ value, deadline, walletClient });
    } catch (error) {
      console.error("Permit signing failed:", error);
    } finally {
      setIsPermitSigning(false);
    }
  };

  const copyPermitSignature = async () => {
    if (!permitSignature) return;
    try {
      await navigator.clipboard.writeText(permitSignature);
    } catch {}
  };

  const disabled = !walletClient || !address || isPermitSigning;

  return (
    <div className="card bg-base-100 shadow-xl h-fit">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">EIP-712 Permit</h2>
          <div className="badge badge-outline">Chain ID: {chainId}</div>
        </div>
        <p className="text-sm text-base-content/70">
          Test EIP-712 permit signing for ERC-20 tokens. This allows you to
          approve token spending without requiring a transaction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 mb-2">
          <div className="bg-base-200 rounded p-3">
            <div className="text-xs text-base-content/60">Token Name</div>
            <div className="text-sm font-medium truncate">{name ?? "-"}</div>
          </div>
          <div className="bg-base-200 rounded p-3">
            <div className="text-xs text-base-content/60">Permit Version</div>
            <div className="text-sm font-medium truncate">
              {version !== undefined ? String(version) : "-"}
            </div>
          </div>
          <div className="bg-base-200 rounded p-3">
            <div className="text-xs text-base-content/60">Nonce</div>
            <div className="text-sm font-medium truncate">
              {nonce !== undefined ? nonce.toString() : "-"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Contract Address</span>
          </label>
          <AddressInput
            name="permit-contract-address"
            placeholder="0x... or ENS"
            value={permitContractAddress}
            onChange={(val) => setPermitContractAddress(val as Address)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Spender Address</span>
          </label>
          <AddressInput
            name="permit-spender-address"
            placeholder="0x... or ENS"
            value={permitSpenderAddress}
            onChange={(val) => setPermitSpenderAddress(val as Address)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Value (minimum units)</span>
            </label>
            <IntegerInput
              name="permit-value"
              placeholder="1000000"
              value={permitValue}
              onChange={(val) => setPermitValue(val)}
              disableMultiplyBy1e18
            />
            <p className="text-xs text-base-content/60 m-0">
              Amount to approve
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Deadline (unix seconds)</span>
            </label>
            <IntegerInput
              name="permit-deadline"
              placeholder={`${Math.floor(Date.now() / 1000) + 3600}`}
              value={permitDeadline}
              onChange={(val) => setPermitDeadline(val)}
              disableMultiplyBy1e18
            />
            <p className="text-xs text-base-content/60 m-0">
              Leave empty to sign with 1 hour from now
            </p>
          </div>
        </div>

        <button
          onClick={handlePermitSign}
          disabled={disabled}
          className="btn btn-success w-full"
        >
          {isPermitSigning ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Sign Permit"
          )}
        </button>

        {permitError && (
          <div className="alert alert-error">
            <span className="text-sm">{permitError.message}</span>
          </div>
        )}

        {permitSignature && (
          <div className="alert alert-success">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-medium">Permit Signature (hex)</div>
                <div className="bg-base-200 rounded p-3 w-full max-h-40 overflow-auto">
                  <code className="text-xs whitespace-pre-wrap break-all font-mono text-base-content">
                    {permitSignature}
                  </code>
                </div>
              </div>
              <button
                onClick={copyPermitSignature}
                className="btn btn-xs btn-outline self-start"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
