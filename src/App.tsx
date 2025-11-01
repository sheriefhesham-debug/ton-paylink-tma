import { useState } from 'react'; 
import { Header } from './components/Header';
import { InvoiceForm, type Invoice } from './components/InvoiceForm'; // Import Invoice type
import { Disclaimer } from './components/Disclaimer';
import { ConnectPlaceholder } from './components/ConnectPlaceholder';
import { Dashboard } from './components/Dashboard'; 
import { PaymentDetailsPage } from './components/PaymentDetailsPage'; // Import new page
import { useTonWallet } from '@tonconnect/ui-react';
import './app.css';
import { Toaster } from 'react-hot-toast'; 

// Update Screen state to include the new page
type Screen = 'create' | 'dashboard' | 'paymentDetails';

function App() {
  const wallet = useTonWallet();
  const [currentScreen, setCurrentScreen] = useState<Screen>('create');
  // New state to hold the invoice we want to show details for
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // --- Navigation Functions ---
  const showDashboard = () => {
    setCurrentScreen('dashboard');
    setSelectedInvoice(null); // Clear selected invoice
  };

  const showCreateInvoice = () => {
    setCurrentScreen('create');
    setSelectedInvoice(null);
  };
  
  const showPaymentDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice); // Set the invoice to show
    setCurrentScreen('paymentDetails'); // Change the screen
  };

  // --- Render Logic ---
  const renderScreen = () => {
    if (!wallet) {
      return <ConnectPlaceholder />;
    }
    
    switch (currentScreen) {
      case 'create':
        return <InvoiceForm />;
      case 'dashboard':
        // Pass the showPaymentDetails function to the dashboard
        return <Dashboard onShowPayment={showPaymentDetails} />;
      case 'paymentDetails':
        // If we're on this screen but no invoice is selected (shouldn't happen), go back
        if (!selectedInvoice) {
          showDashboard(); 
          return null;
        }
        return <PaymentDetailsPage invoice={selectedInvoice} onBack={showDashboard} />;
      default:
        return <InvoiceForm />;
    }
  };

  return (
    <div className="app-container">
      <Header />

      {/* Navigation Tabs (only show on create/dashboard) */}
      {wallet && (currentScreen === 'create' || currentScreen === 'dashboard') && (
        <div className="navigation-tabs">
          <button 
            onClick={showCreateInvoice}
            className={currentScreen === 'create' ? 'active' : ''}
          >
            Create Invoice
          </button>
          <button 
            onClick={showDashboard}
            className={currentScreen === 'dashboard' ? 'active' : ''}
          >
            My Invoices
          </button>
        </div>
      )}

      {/* Render the correct screen */}
      {renderScreen()}

      <Disclaimer />
      <Toaster position="bottom-center" toastOptions={{duration: 4000}} /> 
    </div>
  )
}

export default App;