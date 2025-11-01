import type { Invoice } from './InvoiceForm';
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

// --- Define the props interface ---
interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
  onShowPayment: (invoice: Invoice) => void;
}

export function InvoiceCard({ invoice, onDelete, onShowPayment }: InvoiceCardProps) {
  const wallet = useTonWallet();

  // --- Helper functions ---
  const getStatusClass = (statusValue: 'Pending' | 'Paid') => {
    return statusValue === 'Paid' ? 'status-paid' : 'status-pending';
  };

  const formatTimestamp = (timestampValue: number) => {
    return new Date(timestampValue).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // --- TON Scan link for wallet owner ---
  const tonscanLink = wallet?.account?.address
    ? `https://testnet.tonscan.org/address/${Address.parse(wallet.account.address).toString({ testOnly: true })}`
    : '#';

  // --- This button opens the payment link page ---
  const handleShowDetailsClick = () => {
    console.log("Show Details clicked for invoice:", invoice.id);
    if (!wallet?.account?.address) {
      toast.error("Wallet not connected.");
      return;
    }
    // Notify parent (App.tsx) to switch to the payment view
    onShowPayment(invoice);
  };

  return (
    <div className="invoice-card">
      <div className="card-row">
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
          <a
            href={tonscanLink}
            target="_blank"
            rel="noopener noreferrer"
            className="tonscan-link"
            title="View Owner on Explorer"
          >
            🔗
          </a>
        </div>
      </div>

      <div className="card-row details">
        <span className="amount">${invoice.amount.toFixed(2)}</span>
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>

      <div className="card-actions">
        {/* Get Payment Link */}
        <button
          onClick={handleShowDetailsClick}
          className="pdf-button"
          title="Get Payment Link"
        >
          🔗 Get Link
        </button>

        {/* Delete Invoice */}
        <button
          onClick={() => onDelete(invoice.id)}
          className="delete-button"
          title="Delete Record"
        >
          🗑️
        </button>
      </div>

      {/* Hidden QR Canvas for payment link */}
      {(() => {
        if (!wallet?.account?.address) return null;
        const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });
        const tonAmount = invoice.tonAmount || invoice.amount / 7; // fallback conversion
        const amountString = tonAmount.toFixed(9);
        const amountInNanoTon = toNano(amountString);

        // Truncate long invoice IDs for memo safety
        const safeId = invoice.id.length > 30 ? invoice.id.slice(0, 30) : invoice.id;

        const paymentLinkValue = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${safeId}`;

        return (
          <QRCodeCanvas
            id={`qr-${invoice.id}`}
            value={paymentLinkValue}
            size={256}
            level="H"
            includeMargin={true}
            style={{ display: 'none' }}
          />
        );
      })()}
    </div>
  );
}
