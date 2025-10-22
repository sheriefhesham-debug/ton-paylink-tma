import type { Invoice } from './InvoiceForm'; // Import the type
import './invoiceCard.css';

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  // Function to get a style class based on status
  const getStatusClass = (status: 'Pending' | 'Paid') => {
    return status === 'Paid' ? 'status-paid' : 'status-pending';
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit' 
    });
  };

  return (
    <div className="invoice-card">
      <div className="card-row">
        <span className="description">{invoice.description}</span>
        <span className={`status-badge ${getStatusClass(invoice.status)}`}>
          {invoice.status}
        </span>
      </div>
      <div className="card-row details">
        <span className="amount">${invoice.amount.toFixed(2)}</span>
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      {/* We can add a link to Tonscan using invoice.txHash later */}
    </div>
  );
}