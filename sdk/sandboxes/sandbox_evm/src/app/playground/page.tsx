import type { NextPage } from "next";

import { getMetadata } from "@keplr-ewallet-sandbox-evm/utils/scaffold-eth/getMetadata";
import { SigningPlayground } from "./_components/SigningPlayground";

export const metadata = getMetadata({
  title: "Playground",
  description: "Playground for Testing Signing",
});

const Playground: NextPage = () => {
  return <SigningPlayground />;
};

export default Playground;
