import { useState } from 'react'; // Ensure useState is imported
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { Disclaimer } from './components/Disclaimer';
import { ConnectPlaceholder } from './components/ConnectPlaceholder';
import { Dashboard } from './components/Dashboard'; // Ensure Dashboard is imported
import { useTonWallet } from '@tonconnect/ui-react';
import './app.css'; // Ensure app.css is imported

// Define possible screens/views
type Screen = 'create' | 'dashboard';

function App() {
  const wallet = useTonWallet();
  // Ensure state variable is correctly defined
  const [currentScreen, setCurrentScreen] = useState<Screen>('create'); 

  return (
    <div className="app-container">
      <Header />

      {/* Ensure navigation tabs are present and inside the wallet check */}
      {wallet && ( 
        <div className="navigation-tabs">
          <button 
            onClick={() => setCurrentScreen('create')}
            // Apply 'active' class based on state
            className={currentScreen === 'create' ? 'active' : ''} 
          >
            Create Invoice
          </button>
          <button 
            onClick={() => setCurrentScreen('dashboard')}
            // Apply 'active' class based on state
            className={currentScreen === 'dashboard' ? 'active' : ''}
          >
            My Invoices
          </button>
        </div>
      )}

      {/* Ensure conditional rendering logic is correct */}
      { !wallet ? (
        <ConnectPlaceholder /> 
      ) : currentScreen === 'create' ? (
        <InvoiceForm /> 
      ) : (
        <Dashboard /> 
      )}

      <Disclaimer /> 
    </div>
  )
}

export default App ; 