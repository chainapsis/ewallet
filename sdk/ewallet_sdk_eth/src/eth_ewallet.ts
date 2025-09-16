import type { EthEWalletInterface } from "./types";
import { init } from "./static/init";
import { getEthereumProvider } from "./methods/get_ethereum_provider";
import { personalSign } from "./methods/personal_sign";
import { switchChain } from "./methods/switch_chain";
import { toViemAccount } from "./methods/to_viem_account";
import { getPublicKey } from "./methods/get_public_key";
import { getAddress } from "./methods/get_address";
import { makeSignature } from "./methods/make_signature";
import { EthEWallet } from "./constructor";

EthEWallet.init = init;

const ptype: EthEWalletInterface = EthEWallet.prototype;

ptype.getEthereumProvider = getEthereumProvider;
ptype.sign = personalSign;
ptype.switchChain = switchChain;
ptype.toViemAccount = toViemAccount;
ptype.getPublicKey = getPublicKey;
ptype.getAddress = getAddress;
ptype.makeSignature = makeSignature;
