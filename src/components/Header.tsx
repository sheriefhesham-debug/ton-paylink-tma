import './header.css';
import { WalletConnector } from './WalletConnector';
// No extra imports needed for this simple button

export function Header() {

  // Function to open the TON purchase link
  const handleBuyTonClick = () => {
    // Using the official TON site's buy page, opens in a new tab
    window.open('https://ton.org/buy', '_blank', 'noopener,noreferrer');
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
          <button onClick={handleBuyTonClick} className="buy-ton-button" title="Find where to buy TON">
            Buy TON 💰 {/* Using a simple emoji for visual cue */}
          </button>
          <WalletConnector />
        </div>
      </header>
    </>
  );
}