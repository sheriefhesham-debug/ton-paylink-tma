import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { Disclaimer } from './components/Disclaimer';
import { ConnectPlaceholder } from './components/ConnectPlaceholder'; // Import our new component
import { useTonWallet } from '@tonconnect/ui-react'; // Import the hook to check the wallet
import './app.css';

function App() {
  const wallet = useTonWallet(); // Get the current wallet state

  return (
    <div className="app-container">
      <Header />

      {/* This is the new logic: */}
      { wallet ? (
        <InvoiceForm /> // IF the wallet exists (is connected), show the form
      ) : (
        <ConnectPlaceholder /> // ELSE (if wallet is null), show the placeholder
      )}

      <Disclaimer /> 
    </div>
  )
}

export default App;