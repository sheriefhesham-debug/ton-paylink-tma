import { useState } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { Disclaimer } from './components/Disclaimer';
import { ConnectPlaceholder } from './components/ConnectPlaceholder';
import { Dashboard } from './components/Dashboard';
import { useTonWallet } from '@tonconnect/ui-react';
import './app.css';
import { Toaster } from 'react-hot-toast'; // <-- 1. Import Toaster

type Screen = 'create' | 'dashboard';

function App() {
  const wallet = useTonWallet();
  const [currentScreen, setCurrentScreen] = useState<Screen>('create');

  return (
    <div className="app-container">
      <Header />

      {wallet && (
        <div className="navigation-tabs">
          {/* ... Navigation Buttons ... */}
          <button
            onClick={() => setCurrentScreen('create')}
            className={currentScreen === 'create' ? 'active' : ''}
          >
            Create Invoice
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={currentScreen === 'dashboard' ? 'active' : ''}
          >
            My Invoices
          </button>
        </div>
      )}

      { !wallet ? (
        <ConnectPlaceholder />
      ) : currentScreen === 'create' ? (
        <InvoiceForm />
      ) : (
        <Dashboard />
      )}

      <Disclaimer />
      <Toaster position="bottom-center" /> {/* <-- 2. Add Toaster Component */}
    </div>
  )
}

export default App;