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
  const wallet = useTonWallet(); // This is now used
  const [currentScreen, setCurrentScreen] = useState<Screen>('create'); // These are now used

  return (
    <div className="app-container">
      <Header />

      {/* Navigation Tabs are UNCOMMENTED */}
      {wallet && ( 
        <div className="navigation-tabs">
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

      {/* Conditional Rendering Logic is UNCOMMENTED */}
      { !wallet ? (
        <ConnectPlaceholder /> // This is now used
      ) : currentScreen === 'create' ? (
        <InvoiceForm /> // This is now used
      ) : (
        <Dashboard /> // This is now used
      )}

      <Disclaimer /> 
    </div>
  )
}

export default App;