import "@rainbow-me/rainbowkit/styles.css";
import "@oko-wallet-sandbox-evm/styles/globals.css";

import { ScaffoldEthAppWithProviders } from "@oko-wallet-sandbox-evm/components/ScaffoldEthAppWithProviders";
import { getMetadata } from "@oko-wallet-sandbox-evm/utils/scaffold-eth/getMetadata";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body suppressHydrationWarning>
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
