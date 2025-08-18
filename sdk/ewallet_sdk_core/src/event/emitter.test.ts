import { EventEmitter2 } from "./emitter";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const emitter = new EventEmitter2();

    emitter.emit("_accountsChanged", { email: "", publicKey: "" });

    emitter.on("_accountsChanged", (_payload: any) => {
      // typechecking
    });
    //
    emitter.on("_chainChanged", (_payload: any) => {
      // typechecking
    });
  });
});
