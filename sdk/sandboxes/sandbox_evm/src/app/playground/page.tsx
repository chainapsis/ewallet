import type { NextPage } from "next";

import { getMetadata } from "@keplr-ewallet-sandbox-evm/utils/scaffold-eth/getMetadata";
import { SigningPlayground } from "@keplr-ewallet-sandbox-evm/app/playground/_components/SigningPlayground";

export const metadata = getMetadata({
  title: "Signing Playground",
  description: "Test personal signing and EIP-712 permit signing with Oko",
});

const Playground: NextPage = () => {
  return <SigningPlayground />;
};

export default Playground;
