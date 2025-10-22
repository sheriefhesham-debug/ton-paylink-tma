import { useState } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { Disclaimer } from './components/Disclaimer';
import { ConnectPlaceholder } from './components/ConnectPlaceholder';
import { Dashboard } from './components/Dashboard';
import { useTonWallet } from '@tonconnect/ui-react';
import './app.css';

type Screen = 'create' | 'dashboard';

function App() {
  const wallet = useTonWallet();
  const [currentScreen, setCurrentScreen] = useState<Screen>('create');

  return (
    <div className="app-container">
      <Header />

      {/* --- TEMPORARILY COMMENTED OUT NAVIGATION ---
      {wallet && (
        <div className="navigation-tabs">
          <button onClick={() => setCurrentScreen('create')} className={currentScreen === 'create' ? 'active' : ''}>
            Create Invoice
          </button>
          <button onClick={() => setCurrentScreen('dashboard')} className={currentScreen === 'dashboard' ? 'active' : ''}>
            My Invoices
          </button>
        </div>
      )}
      */}

      {/* --- TEMPORARILY FORCE DASHBOARD RENDER --- */}
      <Dashboard />
      {/* --- END TEMPORARY CODE --- */}


      {/* --- ORIGINAL CONDITIONAL LOGIC COMMENTED OUT ---
      { !wallet ? (
        <ConnectPlaceholder />
      ) : currentScreen === 'create' ? (
        <InvoiceForm />
      ) : (
        <Dashboard />
      )}
      */}

      <Disclaimer />
    </div>
  )
}

export default App;