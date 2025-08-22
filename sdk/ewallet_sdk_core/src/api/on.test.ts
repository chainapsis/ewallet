import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const ewallet = new KeplrEWallet("", {} as any, "", Promise.resolve(true));

    // ewallet.on("_accountsChanged", (_args) => { });
    // ewallet.on("_chainChanged", (_args) => { });
  });
});
