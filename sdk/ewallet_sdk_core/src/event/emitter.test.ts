import { EventEmitter2 } from "./emitter";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const emitter = new EventEmitter2();

    emitter.on("accountsChanged", (_payload) => {
      // typechecking
    });

    emitter.on("chainChanged", (_payload) => {
      // typechecking
    });
  });
});
