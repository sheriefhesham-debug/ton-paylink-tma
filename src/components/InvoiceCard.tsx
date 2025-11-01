import type { Invoice } from './InvoiceForm';
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import toast from 'react-hot-toast';
// Removed jsPDF and QRCodeCanvas as we will render the QR on the new page

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
  // New prop: A function to call to show the payment details page
  onShowPayment: (invoice: Invoice) => void; 
}

// Update the function signature
export function InvoiceCard({ invoice, onDelete, onShowPayment }: InvoiceCardProps) {
  const wallet = useTonWallet();

  const getStatusClass = (statusValue: 'Pending' | 'Paid') => {
    return statusValue === 'Paid' ? 'status-paid' : 'status-pending';
  };

  const formatTimestamp = (timestampValue: number) => {
    return new Date(timestampValue).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const tonscanLink = wallet?.account?.address
      ? `https://testnet.tonscan.org/address/${Address.parse(wallet.account.address).toString({ testOnly: true })}`
      : '#';

  // --- This function now just calls the prop ---
  const handleShowDetailsClick = () => {
    console.log("Show Details clicked for invoice:", invoice.id);
    if (!wallet?.account?.address) {
        toast.error("Wallet not connected.");
        return;
    }
    // Call the function from App.tsx to change the screen
    onShowPayment(invoice); 
  };

  return (
    <div className="invoice-card">
      <div className="card-row">
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>{invoice.status}</span>
          <a href={tonscanLink} target="_blank" rel="noopener noreferrer" className="tonscan-link" title="View Owner on Explorer">🔗</a>
        </div>
      </div>
      <div className="card-row details">
        <span className="amount">${invoice.amount.toFixed(2)}</span>
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      <div className="card-actions">
          {/* Changed button text and function */}
          <button onClick={handleShowDetailsClick} className="pdf-button" title="Get Payment Link">
              🔗 Get Link
          </button>
          <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">🗑️</button>
      </div>
      {/* Removed the hidden QR code canvas */}
    </div>
  );
}