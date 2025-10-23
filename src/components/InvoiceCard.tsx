import type { Invoice } from './InvoiceForm'; // Import the type using 'import type'
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

// Define the props the component expects
interface InvoiceCardProps {
  invoice: Invoice; // The invoice data object
  onDelete: (id: string) => void; // The function to call when delete is clicked
}

// Ensure the component is exported
export function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const wallet = useTonWallet();

  // Helper function to get CSS class based on status
  const getStatusClass = (statusValue: 'Pending' | 'Paid') => {
    // Explicitly use the parameter 'statusValue'
    return statusValue === 'Paid' ? 'status-paid' : 'status-pending';
  };

  // Helper function to format the timestamp
  const formatTimestamp = (timestampValue: number) => {
    // Explicitly use the parameter 'timestampValue'
    return new Date(timestampValue).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  // Construct Tonscan link (Testnet)
  // Ensure wallet and address exist before trying to parse/format
  const tonscanLink = wallet?.account?.address
      ? `https://testnet.tonscan.org/address/${Address.parse(wallet.account.address).toString({ testOnly: true })}`
      : '#'; // Fallback link

  return (
    <div className="invoice-card">
      <div className="card-row">
        {/* Display invoice description */}
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          {/* Display status badge using the helper function */}
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
          {/* Display Tonscan link */}
          <a href={tonscanLink} target="_blank" rel="noopener noreferrer" className="tonscan-link" title="View Owner on Explorer">
            🔗
          </a>
        </div>
      </div>
      <div className="card-row details">
        {/* Display formatted amount */}
        <span className="amount">${invoice.amount.toFixed(2)}</span>
        {/* Display formatted timestamp using the helper function */}
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      <div className="card-actions">
        {/* Delete button calling the onDelete prop */}
        <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">
          🗑️
        </button>
      </div>
    </div>
  );
}