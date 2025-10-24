import './header.css';
import { WalletConnector } from './WalletConnector';
import { useState } from 'react'; // Import useState
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'; // Import Ramp SDK
import { useTonWallet } from '@tonconnect/ui-react'; // Import wallet hook

export function Header() {
  const [isRampOpen, setIsRampOpen] = useState(false); // State to control Ramp widget visibility
  const wallet = useTonWallet(); // Get wallet info to pass to Ramp

  // Function to open the Ramp widget
  const openRamp = () => {
    setIsRampOpen(true);
  };

  // Basic Ramp configuration (replace with your own API key if you get one)
  // Go to https://ramp.network/ to sign up for better customization
  const rampConfig = {
    hostAppName: 'TON PayLink',
    hostLogoUrl: 'https://raw.githubusercontent.com/sheriefhesham-debug/ton-paylink-assets/main/logo.png', // Replace with your logo URL (e.g., GitHub raw link)
    swapAsset: 'TON', // Default to buying TON
    userAddress: wallet?.account?.address ? Address.parse(wallet.account.address).toString({ testOnly: true }) : undefined, // Pre-fill user's address if connected
    // Add your Ramp API key here if you have one:
    // hostApiKey: 'YOUR_RAMP_API_KEY', 
  };

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
        <div className="ramp-modal-overlay"> {/* Optional: Add overlay for styling */}
           <RampInstantSDK
             {...rampConfig} // Spread the config options
             onClose={() => setIsRampOpen(false)} // Close the widget
           />
           {/* Add a close button for the overlay */}
           <button onClick={() => setIsRampOpen(false)} className="ramp-close-button">×</button>
        </div>
      )}
    </>
  );
}

// Need to re-import Address if not already globally available/imported elsewhere
import { Address } from '@ton/core';