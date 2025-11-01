import type { Invoice } from './InvoiceForm';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import './paymentDetailsPage.css'; // We will create this CSS file

interface PaymentDetailsPageProps {
  invoice: Invoice;
  // Function to go back to the dashboard
  onBack: () => void; 
}

export function PaymentDetailsPage({ invoice, onBack }: PaymentDetailsPageProps) {
  const wallet = useTonWallet();

  if (!wallet?.account?.address) {
    // This should almost never happen if accessed from the dashboard
    return (
      <div className="payment-details-container">
        <p>Error: Wallet not connected.</p>
        <button onClick={onBack} className="back-button">&larr; Back</button>
      </div>
    );
  }

  // --- Generate Payment Link ---
  const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });
  // Use the stored TON amount, fall back to calculation
  const tonAmount = invoice.tonAmount || (invoice.amount / 7); // Fallback
  const amountString = tonAmount.toFixed(9);
  const amountInNanoTon = toNano(amountString);
  const paymentLink = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

  // --- Copy Link Function ---
  const handleCopyLink = () => {
      navigator.clipboard.writeText(paymentLink)
          .then(() => toast.success("Payment link copied!"))
          .catch(err => {
              console.error("Failed to copy link:", err);
              toast.error("Failed to copy link.");
          });
  };

  return (
    <div className="payment-details-container">
      {/* Back Button */}
      <button onClick={onBack} className="back-button">&larr; Back to Invoices</button>
      
      <h2>Pay Invoice: {invoice.description}</h2>
      
      <p className="payment-amount">{tonAmount.toFixed(4)} TON</p>
      <p className="payment-amount-usd">($${invoice.amount.toFixed(2)} USD)</p>
      
      {/* Render the QR Code directly */}
      <div className="qr-code-container">
        <QRCodeCanvas
            value={paymentLink}
            size={200}
            level={"H"}
            includeMargin={true}
        />
      </div>
      
      <p className="payment-instructions">Scan with your TON wallet or copy the link below.</p>
      
      {/* Display Payment Link */}
      <div className="link-display">
          <input type="text" readOnly value={paymentLink} className="link-input"/>
          <button onClick={handleCopyLink} className="copy-button" title="Copy Link">
              📋
          </button>
      </div>
    </div>
  );
}