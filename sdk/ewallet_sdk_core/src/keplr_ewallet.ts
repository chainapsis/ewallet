import { sendMsgToIframe } from "./methods/send_msg_to_iframe";
import { showModal } from "./methods/show_modal";
import { signIn } from "./methods/sign_in";
import { signOut } from "./methods/sign_out";
import { getPublicKey } from "./methods/get_public_key";
import { getEmail } from "./methods/get_email";
import { hideModal } from "./methods/hide_modal";
import { on } from "./methods/on";
import type { KeplrEWalletInterface } from "./types";
import { init } from "./static/init";
import { KeplrEWallet } from "./constructor";

KeplrEWallet.init = init;

const ptype: KeplrEWalletInterface = KeplrEWallet.prototype;

ptype.showModal = showModal;
ptype.hideModal = hideModal;
ptype.sendMsgToIframe = sendMsgToIframe;
ptype.signIn = signIn;
ptype.signOut = signOut;
ptype.getPublicKey = getPublicKey;
ptype.getEmail = getEmail;
ptype.on = on;

export { KeplrEWallet };
