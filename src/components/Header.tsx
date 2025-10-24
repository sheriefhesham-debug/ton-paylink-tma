import './header.css';
import { WalletConnector } from './WalletConnector';
// Removed useState, RampSDK, useTonWallet, Address imports as they are no longer used

export function Header() {
  // Removed isRampOpen state, openRamp function, rampConfig

  // Function to open the specific TON purchase link
  const handleBuyTonClick = () => {
    // ** Use the new, specific URL provided by the user **
    window.open(
      'https://ton.org/en/buy-toncoin?filters[exchange_groups][slug][$eq]=buy-with-card&pagination[page]=1&pagination[pageSize]=100',
      '_blank', // Opens in a new tab
      'noopener,noreferrer' // Security attributes
    );
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <img src="/logo.png" alt="TON PayLink Logo" className="logo-image" />
          <h1 className="app-title">TON PayLink</h1>
        </div>
        <div className="app-header-right">
          {/* Button now uses the updated handleBuyTonClick function */}
          <button onClick={handleBuyTonClick} className="buy-ton-button" title="Find where to buy TON">
            Buy TON 💰
          </button>
          <WalletConnector />
        </div>
      </header>
      {/* Removed the Ramp widget conditional rendering */}
    </>
  );
}