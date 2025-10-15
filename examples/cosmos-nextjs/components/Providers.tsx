"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { KeplrEmbeddedProvider } from "./KeplrEmbeddedProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function Providers({ children }: ProvidersProps) {
  return (
    <KeplrEmbeddedProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </KeplrEmbeddedProvider>
  );
}
