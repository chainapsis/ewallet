"use client";

import { useState } from "react";
import { recoverMessageAddress, recoverTypedDataAddress } from "viem";

export function SignatureVerificationWidget() {
  const [verificationType, setVerificationType] = useState<
    "personal" | "typed-data"
  >("personal");

  // Personal Sign Verification
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [personalSignature, setPersonalSignature] = useState("");
  const [personalRecoveredAddress, setPersonalRecoveredAddress] = useState("");
  const [personalError, setPersonalError] = useState("");

  // EIP-712 Typed Data Verification
  const [typedDataDomain, setTypedDataDomain] = useState(`{
  "name": "USDC",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0xA0b86a33E6441b8c4C8C0C0C0C0C0C0C0C0C0C0"
}`);
  const [typedDataTypes, setTypedDataTypes] = useState(`{
  "Permit": [
    {"name": "owner", "type": "address"},
    {"name": "spender", "type": "address"},
    {"name": "value", "type": "uint256"},
    {"name": "nonce", "type": "uint256"},
    {"name": "deadline", "type": "uint256"}
  ]
}`);
  const [typedDataPrimaryType, setTypedDataPrimaryType] =
    useState<string>("Permit");
  const [typedDataMessage, setTypedDataMessage] = useState(`{
  "owner": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "spender": "0xB0b86a33E6441b8c4C8C0C0C0C0C0C0C0C0C0C0",
  "value": "1000000000",
  "nonce": "0",
  "deadline": "1234567890"
}`);
  const [typedDataBlob, setTypedDataBlob] = useState<string>("");
  const [useTypedDataBlob, setUseTypedDataBlob] = useState<boolean>(true);
  const [typedDataSignature, setTypedDataSignature] = useState("");
  const [typedDataRecoveredAddress, setTypedDataRecoveredAddress] =
    useState("");
  const [typedDataError, setTypedDataError] = useState("");

  const parsedTypes = (() => {
    try {
      const t = JSON.parse(typedDataTypes);
      if (t && typeof t === "object") return t as Record<string, any>;
    } catch {}
    return {} as Record<string, any>;
  })();

  const typeNames = Object.keys(parsedTypes);
  const selectedFields = parsedTypes[typedDataPrimaryType] ?? [];

  const verifyPersonalSignature = async () => {
    try {
      setPersonalError("");
      setPersonalRecoveredAddress("");

      if (!personalMessage || !personalSignature) {
        setPersonalError("Please provide both message and signature");
        return;
      }

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

  const verifyTypedDataSignature = async () => {
    try {
      setTypedDataError("");
      setTypedDataRecoveredAddress("");

      if (!typedDataSignature) {
        setTypedDataError("Please provide a signature");
        return;
      }

      if (useTypedDataBlob) {
        if (!typedDataBlob) {
          setTypedDataError("Please provide typed data JSON");
          return;
        }
        let parsed: any;
        try {
          parsed = JSON.parse(typedDataBlob);
        } catch {
          setTypedDataError("Invalid JSON for typed data");
          return;
        }
        const { domain, types, primaryType, message } = parsed ?? {};
        if (!domain || !types || !primaryType || !message) {
          setTypedDataError(
            "Typed data must include domain, types, primaryType, and message",
          );
          return;
        }
        const recoveredAddress = await recoverTypedDataAddress({
          domain,
          types,
          primaryType,
          message,
          signature: typedDataSignature as `0x${string}`,
        });
        setTypedDataRecoveredAddress(recoveredAddress);
        return;
      }

      // Separate fields path
      if (!typedDataDomain || !typedDataTypes || !typedDataMessage) {
        setTypedDataError("Please provide domain, types, and message JSON");
        return;
      }
      const domain = JSON.parse(typedDataDomain);
      const types = JSON.parse(typedDataTypes);
      const message = JSON.parse(typedDataMessage);

      const recoveredAddress = await recoverTypedDataAddress({
        domain,
        types,
        primaryType: typedDataPrimaryType || "Permit",
        message,
        signature: typedDataSignature as `0x${string}`,
      });

      setTypedDataRecoveredAddress(recoveredAddress);
    } catch (error) {
      setTypedDataError(
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

  const resetTypedDataVerification = () => {
    setTypedDataDomain("");
    setTypedDataTypes("");
    setTypedDataMessage("");
    setTypedDataBlob("");
    setTypedDataSignature("");
    setTypedDataRecoveredAddress("");
    setTypedDataError("");
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Signature Verification</h2>
        <p className="text-sm text-base-content/70">
          Verify signatures and recover signer addresses from personal signs and
          EIP-712 typed data. This tool helps you verify that a signature was
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
                verificationType === "typed-data" ? "tab-active" : ""
              }`}
              onClick={() => setVerificationType("typed-data")}
            >
              EIP-712
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
                <div className="bg-base-200 rounded p-3 w-full overflow-x-auto">
                  <code className="text-xs whitespace-pre font-mono text-base-content">
                    {personalRecoveredAddress}
                  </code>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <div className="text-sm">Mode:</div>
              <div className="tabs tabs-boxed">
                <a
                  className={`tab ${useTypedDataBlob ? "tab-active" : ""}`}
                  onClick={() => setUseTypedDataBlob(true)}
                >
                  Single JSON
                </a>
                <a
                  className={`tab ${!useTypedDataBlob ? "tab-active" : ""}`}
                  onClick={() => setUseTypedDataBlob(false)}
                >
                  Separate Fields
                </a>
              </div>
            </div>

            {useTypedDataBlob ? (
              <>
                <label className="label">
                  <span className="label-text">Typed Data JSON</span>
                </label>
                <textarea
                  value={typedDataBlob}
                  onChange={(e) => setTypedDataBlob(e.target.value)}
                  className="textarea textarea-bordered w-full text-base-content"
                  rows={8}
                  placeholder='{"domain": {"name": "Token", "version": "1", "chainId": 1, "verifyingContract": "0x..."}, "types": {"Permit": [...]}, "primaryType": "Permit", "message": { ... }}'
                />
              </>
            ) : (
              <>
                <label className="label">
                  <span className="label-text">Domain (JSON)</span>
                </label>
                <textarea
                  value={typedDataDomain}
                  onChange={(e) => setTypedDataDomain(e.target.value)}
                  className="textarea textarea-bordered w-full text-base-content"
                  rows={4}
                  placeholder='{"name": "Token", "version": "1", "chainId": 1, "verifyingContract": "0x..."}'
                />

                <label className="label">
                  <span className="label-text">Types (JSON)</span>
                </label>
                <textarea
                  value={typedDataTypes}
                  onChange={(e) => setTypedDataTypes(e.target.value)}
                  className="textarea textarea-bordered w-full text-base-content"
                  rows={4}
                  placeholder='{"Permit": [{"name": "owner", "type": "address"}, ...]}'
                />

                <label className="label">
                  <span className="label-text">Primary Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={typedDataPrimaryType}
                  onChange={(e) => setTypedDataPrimaryType(e.target.value)}
                >
                  {typeNames.length === 0 ? (
                    <option value="">-</option>
                  ) : (
                    typeNames.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  )}
                </select>

                {/* Show selected type fields */}
                {selectedFields && Array.isArray(selectedFields) && (
                  <div className="bg-base-200 rounded p-3">
                    <div className="text-xs text-base-content/60 mb-2">
                      Fields for {typedDataPrimaryType}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedFields.map((f: any, idx: number) => (
                        <div
                          key={`${f?.name ?? "field"}-${idx}`}
                          className="text-xs text-base-content"
                        >
                          <span className="font-mono">{String(f?.name)}</span>
                          <span className="mx-1">:</span>
                          <span className="font-mono opacity-80">
                            {String(f?.type)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="label">
                  <span className="label-text">Message (JSON)</span>
                </label>
                <textarea
                  value={typedDataMessage}
                  onChange={(e) => setTypedDataMessage(e.target.value)}
                  className="textarea textarea-bordered w-full text-base-content"
                  rows={4}
                  placeholder='{"owner": "0x...", "spender": "0x...", "value": "1000000000000000000", "nonce": "0", "deadline": "1234567890"}'
                />
              </>
            )}

            <label className="label">
              <span className="label-text">Signature</span>
            </label>
            <input
              type="text"
              value={typedDataSignature}
              onChange={(e) => setTypedDataSignature(e.target.value)}
              className="input input-bordered w-full"
              placeholder="0x..."
            />

            <div className="flex gap-2">
              <button
                onClick={verifyTypedDataSignature}
                className="btn btn-success flex-1"
              >
                Verify Permit
              </button>
              <button
                onClick={resetTypedDataVerification}
                className="btn btn-ghost"
              >
                Reset
              </button>
            </div>

            {typedDataError && (
              <div className="alert alert-error">
                <span className="text-sm">{typedDataError}</span>
              </div>
            )}

            {typedDataRecoveredAddress && (
              <div className="alert alert-success">
                <div className="font-medium">Signer Address Recovered</div>
                <div className="bg-base-200 rounded p-3 w-full overflow-x-auto">
                  <code className="text-xs whitespace-pre font-mono text-base-content">
                    {typedDataRecoveredAddress}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
