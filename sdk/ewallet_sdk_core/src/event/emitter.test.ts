import { EventEmitter2 } from "./emitter";
import type {
  KeplrWalletCoreEventType,
  KeplrWalletCoreEventHandler,
} from "@keplr-ewallet-sdk-core/types";

describe("sdk core event - static analysis", () => {
  it("t", async () => {
    const emitter = new EventEmitter2<
      KeplrWalletCoreEventType,
      KeplrWalletCoreEventHandler<KeplrWalletCoreEventType>
    >();

    emitter.on("_accountsChanged", (_payload) => {
      _payload;
      // typechecking
    });

    emitter.on("_chainChanged", (_payload) => {
      // typechecking
    });
  });
});
