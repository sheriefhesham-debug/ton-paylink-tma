import type { Invoice } from './InvoiceForm';
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

export function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const wallet = useTonWallet();

  // Helper function: Use the parameter `statusValue`
  const getStatusClass = (statusValue: 'Pending' | 'Paid') => {
    return statusValue === 'Paid' ? 'status-paid' : 'status-pending';
  };

  // Helper function: Use the parameter `timestampValue`
  const formatTimestamp = (timestampValue: number) => {
    return new Date(timestampValue).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const tonscanLink = wallet?.account?.address
      ? `https://testnet.tonscan.org/address/${Address.parse(wallet.account.address).toString({ testOnly: true })}`
      : '#';

  return (
    <div className="invoice-card">
      <div className="card-row">
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          {/* Call helper with invoice.status */}
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
          <a href={tonscanLink} target="_blank" rel="noopener noreferrer" className="tonscan-link" title="View Owner on Explorer">
            🔗
          </a>
        </div>
      </div>
      <div className="card-row details">
        <span className="amount">${invoice.amount.toFixed(2)}</span>
        {/* Call helper with invoice.timestamp */}
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      <div className="card-actions">
        <button onClick={() => onDelete(invoice.id)} className="pdf-button" title="Generate PDF">
          📄 PDF
        </button>
        <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">
          🗑️
        </button>
      </div>
    </div>
  );
}