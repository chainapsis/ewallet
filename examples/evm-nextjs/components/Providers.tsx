"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { OkoEvmProvider } from "./OkoEvmProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function Providers({ children }: ProvidersProps) {
  return (
    <OkoEvmProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </OkoEvmProvider>
  );
}
