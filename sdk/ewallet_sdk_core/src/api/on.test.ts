import { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import { on } from "./on";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    // const emitter = new EventEmitter2();
    //
    // emitter.emit("_accountsChanged", { email: "", publicKey: "" });
    //
    // emitter.on("_accountsChanged", (payload) => {
    //   // typechecking
    // });
    //
    // emitter.on("_chainChanged", (payload) => {
    //   // typechecking
    // });
    const ewallet = new KeplrEWallet("", {} as any, "");
    ewallet.on("_accountsChanged", (args) => { });
  });
});
