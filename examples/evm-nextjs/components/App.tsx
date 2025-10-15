"use client";

import LoginView from "./LoginView";
import ConnectedView from "./ConnectedView";
import useKeplrEmbedded from "@/hooks/useKeplrEmbedded";

export default function App() {
  const { isSignedIn } = useKeplrEmbedded();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {!isSignedIn ? <LoginView /> : <ConnectedView />}
    </div>
  );
}
