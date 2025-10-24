import './header.css';
import { WalletConnector } from './WalletConnector';
// Removed RampSDK, useState, useTonWallet, Address imports

export function Header() {
  // Removed isRampOpen state, openRamp function, rampConfig

  return (
    // Keep the outer <> fragment if needed, or remove if header is the only top-level element
    <> 
      <header className="app-header">
        <div className="app-header-left">
          <img src="/logo.png" alt="TON PayLink Logo" className="logo-image" />
          <h1 className="app-title">TON PayLink</h1>
        </div>
        <div className="app-header-right">
          {/* Only the WalletConnector remains here */}
          <WalletConnector />
        </div>
      </header>
      {/* Removed the Ramp widget conditional rendering */}
    </>
  );
}