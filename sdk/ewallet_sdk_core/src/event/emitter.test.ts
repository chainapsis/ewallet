import { EventEmitter2 } from "./emitter";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const emitter = new EventEmitter2();

    emitter.emit("_accountsChanged", { email: "", publicKey: "" });

    emitter.on("_accountsChanged", (payload) => {
      // typechecking
    });

    emitter.on("_chainChanged", (payload) => {
      // typechecking
    });
  });
});
