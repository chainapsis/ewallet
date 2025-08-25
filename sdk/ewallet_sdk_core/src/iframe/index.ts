import { type Result } from "@keplr-ewallet/stdlib-js";

export const KEPLR_IFRAME_ID = "keplr-ewallet-attached";

export function setUpIframeElement(
  url: URL,
): Result<HTMLIFrameElement, string> {
  const oldEl = document.getElementById(KEPLR_IFRAME_ID);
  if (oldEl !== null) {
    console.warn("[keplr] iframe already exists");

    return {
      success: true,
      data: oldEl as HTMLIFrameElement,
    };
  }

  const bodyEls = document.getElementsByTagName("body");
  if (bodyEls.length < 1 || bodyEls[0] === undefined) {
    console.error("body element not found");
    return {
      success: false,
      err: "body element not found",
    };
  }

  const bodyEl = bodyEls[0];

  console.debug("[keplr] appending iframe");

  // iframe setup
  const iframe = document.createElement("iframe");
  iframe.src = url.toString();

  // iframe style
  iframe.id = KEPLR_IFRAME_ID;
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.style.display = "none";
  iframe.style.backgroundColor = "transparent";
  iframe.style.overflow = "hidden";
  iframe.style.zIndex = "1000000";

  // iframe.setAttribute(
  //   "sandbox",
  //   "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
  // );

  // attach
  bodyEl.appendChild(iframe);

  return { success: true, data: iframe };
}
