import { EventEmitter2 } from "./emitter";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const emitter = new EventEmitter2();

    emitter.on("_accountsChanged", (_payload) => {
      _payload;
      // typechecking
    });

    emitter.on("_chainChanged", (_payload) => {
      // typechecking
    });
  });
});
