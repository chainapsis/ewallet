"use client";

import { useState } from "react";
import { recoverMessageAddress, recoverTypedDataAddress } from "viem";

export function SignatureVerificationWidget() {
  const [verificationType, setVerificationType] = useState<
    "personal" | "permit"
  >("personal");

  // Personal Sign Verification
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [personalSignature, setPersonalSignature] = useState("");
  const [personalRecoveredAddress, setPersonalRecoveredAddress] = useState("");
  const [personalError, setPersonalError] = useState("");

  // EIP-712 Permit Verification
  const [permitDomain, setPermitDomain] = useState(`{
  "name": "USDC",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0xA0b86a33E6441b8c4C8C0C0C0C0C0C0C0C0C0C0"
}`);
  const [permitTypes, setPermitTypes] = useState(`{
  "Permit": [
    {"name": "owner", "type": "address"},
    {"name": "spender", "type": "address"},
    {"name": "value", "type": "uint256"},
    {"name": "nonce", "type": "uint256"},
    {"name": "deadline", "type": "uint256"}
  ]
}`);
  const [permitMessage, setPermitMessage] = useState(`{
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "spender": "0xB0b86a33E6441b8c4C8C0C0C0C0C0C0C0C0C0C0",
  "value": "1000000000",
  "nonce": "0",
  "deadline": "1234567890"
}`);
  const [permitSignature, setPermitSignature] = useState("");
  const [permitRecoveredAddress, setPermitRecoveredAddress] = useState("");
  const [permitError, setPermitError] = useState("");

  const verifyPersonalSignature = async () => {
    try {
      setPersonalError("");
      setPersonalRecoveredAddress("");

      if (!personalMessage || !personalSignature) {
        setPersonalError("Please provide both message and signature");
        return;
      }

      // Convert message to hex if it's not already
      const signableMessage = personalMessage.startsWith("0x")
        ? personalMessage
        : `0x${Buffer.from(personalMessage, "utf8").toString("hex")}`;

      const recoveredAddress = await recoverMessageAddress({
        message: signableMessage,
        signature: personalSignature as `0x${string}`,
      });

      setPersonalRecoveredAddress(recoveredAddress);
    } catch (error) {
      setPersonalError(
        error instanceof Error ? error.message : "Verification failed",
      );
    }
  };

  const verifyPermitSignature = async () => {
    try {
      setPermitError("");
      setPermitRecoveredAddress("");

      if (!permitDomain || !permitTypes || !permitMessage || !permitSignature) {
        setPermitError("Please provide all required fields");
        return;
      }

      // Parse the typed data
      const domain = JSON.parse(permitDomain);
      const types = JSON.parse(permitTypes);
      const message = JSON.parse(permitMessage);

      const recoveredAddress = await recoverTypedDataAddress({
        domain,
        types,
        primaryType: "Permit",
        message,
        signature: permitSignature as `0x${string}`,
      });

      setPermitRecoveredAddress(recoveredAddress);
    } catch (error) {
      setPermitError(
        error instanceof Error ? error.message : "Verification failed",
      );
    }
  };

  const resetPersonalVerification = () => {
    setPersonalMessage("");
    setPersonalSignature("");
    setPersonalRecoveredAddress("");
    setPersonalError("");
  };

  const resetPermitVerification = () => {
    setPermitDomain("");
    setPermitTypes("");
    setPermitMessage("");
    setPermitSignature("");
    setPermitRecoveredAddress("");
    setPermitError("");
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Signature Verification</h2>
        <p className="text-sm text-base-content/70">
          Verify signatures and recover signer addresses from personal signs and
          EIP-712 permits. This tool helps you verify that a signature was
          created by a specific address.
        </p>

        <div className="flex justify-between items-center mb-4">
          <div className="tabs tabs-boxed tabs-border">
            <a
              className={`tab ${
                verificationType === "personal" ? "tab-active" : ""
              }`}
              onClick={() => setVerificationType("personal")}
            >
              Personal Sign
            </a>
            <a
              className={`tab ${
                verificationType === "permit" ? "tab-active" : ""
              }`}
              onClick={() => setVerificationType("permit")}
            >
              EIP-712 Permit
            </a>
          </div>
        </div>

        {verificationType === "personal" ? (
          <div className="space-y-4">
            <label className="label">
              <span className="label-text">Original Message</span>
            </label>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="textarea textarea-bordered w-full text-base-content"
              rows={4}
              placeholder="Enter the original message that was signed..."
            />
            <p className="text-xs text-base-content/60 -mt-2">
              The exact message that was signed (will be converted to hex).
              Example: "Hello, Keplr E-Wallet!"
            </p>

            <label className="label">
              <span className="label-text">Signature</span>
            </label>
            <input
              type="text"
              value={personalSignature}
              onChange={(e) => setPersonalSignature(e.target.value)}
              className="input input-bordered w-full"
              placeholder="0x..."
            />
            <p className="text-xs text-base-content/60 -mt-2">
              The signature to verify (0x-prefixed hex string). Example:
              0x1234...abcd
            </p>

            <div className="flex gap-2">
              <button
                onClick={verifyPersonalSignature}
                className="btn btn-primary flex-1"
              >
                Verify Signature
              </button>
              <button
                onClick={resetPersonalVerification}
                className="btn btn-ghost"
              >
                Reset
              </button>
            </div>

            {personalError && (
              <div className="alert alert-error">
                <span className="text-sm">{personalError}</span>
              </div>
            )}

            {personalRecoveredAddress && (
              <div className="alert alert-success">
                <div className="font-medium">Signer Address Recovered</div>
                <code className="text-xs break-all whitespace-pre-wrap w-full font-mono">
                  {personalRecoveredAddress}
                </code>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="label">
              <span className="label-text">Domain (JSON)</span>
            </label>
            <textarea
              value={permitDomain}
              onChange={(e) => setPermitDomain(e.target.value)}
              className="textarea textarea-bordered w-full text-base-content"
              rows={4}
              placeholder='{"name": "Token", "version": "1", "chainId": 1, "verifyingContract": "0x..."}'
            />
            <p className="text-xs text-base-content/60 -mt-2">
              EIP-712 domain as JSON. Contains name, version, chainId, and
              verifyingContract.
            </p>

            <label className="label">
              <span className="label-text">Types (JSON)</span>
            </label>
            <textarea
              value={permitTypes}
              onChange={(e) => setPermitTypes(e.target.value)}
              className="textarea textarea-bordered w-full text-base-content"
              rows={4}
              placeholder='{"Permit": [{"name": "owner", "type": "address"}, ...]}'
            />
            <p className="text-xs text-base-content/60 -mt-2">
              EIP-712 types as JSON. Defines the structure of the message being
              signed.
            </p>

            <label className="label">
              <span className="label-text">Message (JSON)</span>
            </label>
            <textarea
              value={permitMessage}
              onChange={(e) => setPermitMessage(e.target.value)}
              className="textarea textarea-bordered w-full text-base-content"
              rows={4}
              placeholder='{"owner": "0x...", "spender": "0x...", "value": "1000000000000000000", "nonce": "0", "deadline": "1234567890"}'
            />
            <p className="text-xs text-base-content/60 -mt-2">
              EIP-712 message as JSON. The actual data that was signed according
              to the types.
            </p>

            <label className="label">
              <span className="label-text">Signature</span>
            </label>
            <input
              type="text"
              value={permitSignature}
              onChange={(e) => setPermitSignature(e.target.value)}
              className="input input-bordered w-full"
              placeholder="0x..."
            />
            <p className="text-xs text-base-content/60 -mt-2">
              The signature to verify (0x-prefixed hex string). Example:
              0x1234...abcd
            </p>

            <div className="flex gap-2">
              <button
                onClick={verifyPermitSignature}
                className="btn btn-success flex-1"
              >
                Verify Permit
              </button>
              <button
                onClick={resetPermitVerification}
                className="btn btn-ghost"
              >
                Reset
              </button>
            </div>

            {permitError && (
              <div className="alert alert-error">
                <span className="text-sm">{permitError}</span>
              </div>
            )}

            {permitRecoveredAddress && (
              <div className="alert alert-success">
                <div className="font-medium">Signer Address Recovered</div>
                <code className="text-xs break-all whitespace-pre-wrap w-full font-mono">
                  {permitRecoveredAddress}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
