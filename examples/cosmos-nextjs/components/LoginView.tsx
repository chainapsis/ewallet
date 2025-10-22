"use client";

import Image from "next/image";

import Button from "./Button";
import useOkoCosmos from "@/hooks/useOkoCosmos";

export default function LoginView() {
  const { isReady, isSigningIn, signIn } = useOkoCosmos();

  return (
    <div className="text-center max-w-md mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
          <Image src="/icon.png" alt="Oko" width={96} height={96} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-bold">Welcome to Oko</h2>
          <p className="text-gray-400 text-lg">
            Sign in to get started with Cosmos chains
          </p>
        </div>
      </div>
      <Button
        onClick={signIn}
        fullWidth
        size="lg"
        disabled={!isReady || isSigningIn}
        loading={!isReady || isSigningIn}
      >
        Sign in
      </Button>
    </div>
  );
}
