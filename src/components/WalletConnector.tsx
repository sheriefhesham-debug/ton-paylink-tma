"use client"; // This special line is required by React

import { TonConnectButton } from "@tonconnect/ui-react";

export function WalletConnector() {
  return (
    <div className="app-header-right">
      <TonConnectButton />
    </div>
  );
}