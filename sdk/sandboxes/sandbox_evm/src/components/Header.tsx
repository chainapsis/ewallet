"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  Bars3Icon,
  BugAntIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { FaucetButton } from "@keplr-ewallet-sandbox-evm/components/scaffold-eth";
import {
  useOutsideClick,
  useTargetNetwork,
} from "@keplr-ewallet-sandbox-evm/hooks/scaffold-eth";
import { useKeplrEwallet } from "@keplr-ewallet-sandbox-evm/contexts/KeplrEwalletProvider";
import { keplrIcon } from "@keplr-ewallet-sandbox-evm/assets/icon";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "Block Explorer",
    href: "/blockexplorer",
    icon: <GlobeAltIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const { eWallet, isInitialized, setIsAuthenticated } = useKeplrEwallet();

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link
          href="/"
          passHref
          className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0"
        >
          <div className="flex flex-row items-center gap-2">
            <img src={keplrIcon} alt="keplr" className="w-8 h-8" />
            <span className="font-bold leading-tight">EVM Sandbox</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 gap-2">
        {/* TODO: show keplr ewallet connection state */}
        <button
          className="btn btn-primary rounded-lg"
          onClick={async () => {
            if (eWallet) {
              try {
                await eWallet.signIn("google");
                console.log("sign in success");
                setIsAuthenticated(true);
              } catch (error) {
                console.error("Sign in failed:", error);
              }
            }
          }}
        >
          Connect Keplr E-Wallet
        </button>
        <ConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
