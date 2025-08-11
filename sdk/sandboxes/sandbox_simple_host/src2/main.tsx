import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

async function main() {
  const root = document.getElementById("root");

  if (root === null) {
    console.error("[attached] root elem not found");
    return;
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/google/callback" element={<GoogleCallback />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

main().then();
