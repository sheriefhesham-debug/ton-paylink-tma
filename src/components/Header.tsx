import './header.css';
import { WalletConnector } from './WalletConnector';
import { useState } from 'react'; // Import useState
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'; // Import Ramp SDK
import { useTonWallet } from '@tonconnect/ui-react'; // Import wallet hook
import { Address } from '@ton/core'; // Ensure Address is imported

export function Header() {
  const [isRampOpen, setIsRampOpen] = useState(false); // State to control Ramp widget visibility
  const wallet = useTonWallet(); // Get wallet info to pass to Ramp

  // Function to open the Ramp widget
  const openRamp = () => {
    console.log("--- 'Buy TON' button clicked! ---"); // Log button click
    setIsRampOpen(true);
    console.log("--- isRampOpen state set to true ---"); // Log state update
  };

  // Basic Ramp configuration (replace with your own API key if you get one)
  // Go to https://ramp.network/ to sign up for better customization
  const rampConfig = {
    hostAppName: 'TON PayLink',
    // ** IMPORTANT: Replace with your permanent logo URL (e.g., GitHub raw link) **
    hostLogoUrl: 'https://raw.githubusercontent.com/sheriefhesham-debug/ton-paylink-assets/main/logo.png', 
    swapAsset: 'TON', // Default to buying TON
    // Pre-fill user's address if connected, ensuring it's in user-friendly format
    userAddress: wallet?.account?.address ? Address.parse(wallet.account.address).toString({ testOnly: true }) : undefined, 
    // Add your Ramp API key here if you have one:
    // hostApiKey: 'YOUR_RAMP_API_KEY', 
  };

  console.log("Header rendering. isRampOpen:", isRampOpen); // Log check state on render

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <img src="/logo.png" alt="TON PayLink Logo" className="logo-image" />
          <h1 className="app-title">TON PayLink</h1>
        </div>
        <div className="app-header-right">
          {/* Add the "Buy TON" button */}
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
             {...rampConfig} // Spread the config options
             onClose={() => {
                 console.log("--- Ramp onClose event triggered ---"); // Log check close event
                 setIsRampOpen(false);
             }}
           />
           {/* Add a close button for the overlay */}
           <button onClick={() => setIsRampOpen(false)} className="ramp-close-button">×</button>
        </div>
      )}
    </>
  );
}