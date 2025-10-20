import './header.css';
import { WalletConnector } from './WalletConnector'; // Import our new component

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <img src="/logo.png" alt="TON PayLink Logo" className="logo-image" />
        <h1 className="app-title">TON PayLink</h1>
      </div>
      <WalletConnector />
    </header>
  );
}