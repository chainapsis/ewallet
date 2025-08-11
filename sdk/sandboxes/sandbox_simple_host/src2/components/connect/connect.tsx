import React from "react";
import { useLocation } from "react-router";

import { useAppState } from "@keplr-ewallet-attached/store/app";

const GoogleClientId =
  "239646646986-8on7ql1vmbcshbjk12bdtopmto99iipm.apps.googleusercontent.com";

export const Connect: React.FC = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const oauthProvider = params.get("oauthProvider");
  const accessToken = params.get("accessToken");
  const idToken = params.get("idToken");
  const targetOrigin = params.get("targetOrigin");
  const keplrEwalletAppId = params.get("keplrEwalletAppId");
  const connect = params.get("connect");

  const isGoogleConnected =
    oauthProvider === "google" &&
    accessToken &&
    idToken &&
    targetOrigin &&
    keplrEwalletAppId;

  const [approved, setApproved] = React.useState(false);

  React.useEffect(() => {
    if (isGoogleConnected && connect !== "true") {
      // TODO: @elden
      // connect가 true가 아니면 자동 승인
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "connect_ack",
              message: `you are connected to keplr ewallet from ${targetOrigin}`,
              keplrEwalletAppId,
              oauthProvider,
              connect,
            },
            "*",
          );
        }
        window.close();
      }, 1500);
    }
  }, [
    isGoogleConnected,
    targetOrigin,
    keplrEwalletAppId,
    oauthProvider,
    connect,
  ]);

  // 승인 버튼 클릭 시 메시지 전송 및 창 닫기
  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "connect_ack",
            message: `you are connected to keplr ewallet from ${targetOrigin}`,
            keplrEwalletAppId,
            oauthProvider,
            connect,
          },
          "*",
        );
      }
      window.close();
    }, 1000);
  };

  if (isGoogleConnected && connect === "true") {
    if (approved) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <img
            src="./favicon.ico"
            alt="Keplr logo"
            style={{ width: 36, height: 36, marginBottom: 20 }}
          />
          <h2>구글 계정이 성공적으로 연결되었습니다.</h2>
          <p>잠시 후 창이 자동으로 닫힙니다...</p>
        </div>
      );
    }
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 100,
        }}
      >
        <img
          src="./favicon.ico"
          alt="Keplr logo"
          style={{ width: 36, height: 36, marginBottom: 20 }}
        />
        <h2>구글 계정 연결 요청</h2>
        <p>
          <b>{targetOrigin}</b>에서 Keplr E-Wallet 연결을 요청했습니다.
          <br />
          연결을 허용하시겠습니까?
        </p>
        <button
          onClick={handleApprove}
          style={{
            marginTop: 24,
            padding: "10px 24px",
            fontSize: 16,
            borderRadius: 4,
            border: "none",
            background: "#4285F4",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          허용
        </button>
      </div>
    );
  }

  if (isGoogleConnected) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 100,
        }}
      >
        <img
          src="./favicon.ico"
          alt="Keplr logo"
          style={{ width: 36, height: 36, marginBottom: 20 }}
        />
        <h2>구글 계정이 성공적으로 연결되었습니다.</h2>
        <p>잠시 후 창이 자동으로 닫힙니다...</p>
      </div>
    );
  }

  // 기존 connect 페이지
  // TODO: remove this function, this is for popup sign in test
  const handleGoogleSignIn = () => {
    const requestOrigin = params.get("requestOrigin");
    const keplrEwalletAppId = params.get("keplrEWalletAppId");
    const connect = params.get("connect");
    if (!requestOrigin) {
      throw new Error("requestOrigin is not found");
    }

    if (!keplrEwalletAppId) {
      throw new Error("eWalletAppId is not found");
    }

    const currentOrigin = window.location.origin;

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GoogleClientId);
    authUrl.searchParams.set(
      "redirect_uri",
      `${currentOrigin}/google/callback`,
    );

    // TODO: nonce will be used in the future
    const appState = useAppState.getState();
    const nonce = appState.getNonce(requestOrigin);
    if (!nonce) {
      throw new Error("nonce is not found");
    }

    // Google implicit auth flow
    // See https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
    authUrl.searchParams.set("response_type", "token id_token");

    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "login");
    authUrl.searchParams.set("nonce", nonce);

    const state = JSON.stringify({
      requestOrigin,
      keplrEwalletAppId,
      connect,
    });

    authUrl.searchParams.set("state", state);

    window.location.href = authUrl.toString();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="./favicon.ico"
          alt="Keplr logo"
          style={{ width: 36, height: 36, marginRight: 10 }}
        />
        <h2>Connect to Keplr E-Wallet</h2>
      </div>
      <button
        onClick={handleGoogleSignIn}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          border: "1px solid #ccc",
          borderRadius: 4,
          background: "#fff",
          cursor: "pointer",
          fontSize: 16,
          marginTop: 20,
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
          alt="Google logo"
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        Sign in with Google
      </button>
    </div>
  );
};
