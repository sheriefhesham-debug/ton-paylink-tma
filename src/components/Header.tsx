import './header.css';
import { WalletConnector } from './WalletConnector';
import { useState } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
// Removed unused imports: useTonWallet, Address

export function Header() {
  const [isRampOpen, setIsRampOpen] = useState(false);
  // Removed unused wallet variable

  const openRamp = () => {
    console.log("--- 'Buy TON' button clicked! ---");
    setIsRampOpen(true);
    console.log("--- isRampOpen state set to true ---");
  };

  // Simplified Ramp configuration
  const rampConfig = {
    hostAppName: 'TON PayLink',
    hostLogoUrl: 'https://raw.githubusercontent.com/sheriefhesham-debug/ton-paylink-assets/main/logo.png',
    // hostApiKey: 'YOUR_RAMP_API_KEY', // Add if you have one
    // We can add swapAsset and userAddress back later if needed
  };

  console.log("Header rendering. isRampOpen:", isRampOpen);

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <img src="/logo.png" alt="TON PayLink Logo" className="logo-image" />
          <h1 className="app-title">TON PayLink</h1>
        </div>
        <div className="app-header-right">
          <button onClick={openRamp} className="buy-ton-button" title="Buy TON Crypto">
            Buy TON 💰
          </button>
          <WalletConnector />
        </div>
      </header>

      {/* Conditionally render the Ramp widget */}
      {isRampOpen && (
        <div className="ramp-modal-overlay">
           <RampInstantSDK
             {...rampConfig} // Use the simplified config
             onClose={() => {
                 console.log("--- Ramp onClose event triggered ---");
                 setIsRampOpen(false);
             }}
           />
           <button onClick={() => setIsRampOpen(false)} className="ramp-close-button">×</button>
        </div>
      )}
    </>
  );
}