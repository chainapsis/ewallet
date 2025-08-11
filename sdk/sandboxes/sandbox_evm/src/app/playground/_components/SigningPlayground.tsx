"use client";

import { PersonalSignWidget } from "./PersonalSignWidget";
import { SignatureVerificationWidget } from "./SignatureVerificationWidget";

export function SigningPlayground() {
  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Signing Playground</h1>
          <p className="text-base-content/70 mt-2">
            Try personal_sign and EIP-712 Permit, then verify signatures.
          </p>
        </div>

        <PersonalSignWidget />
        <SignatureVerificationWidget />
      </div>
    </div>
  );
}
