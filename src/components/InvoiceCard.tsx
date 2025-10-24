import type { Invoice } from './InvoiceForm';
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

export function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const wallet = useTonWallet();

  // Helper function to get CSS class based on status
  const getStatusClass = (statusValue: 'Pending' | 'Paid') => {
    return statusValue === 'Paid' ? 'status-paid' : 'status-pending';
  };

  // Helper function to format the timestamp
  const formatTimestamp = (timestampValue: number) => {
    return new Date(timestampValue).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  // Construct Tonscan link (Testnet)
  const tonscanLink = wallet?.account?.address
      ? `https://testnet.tonscan.org/address/${Address.parse(wallet.account.address).toString({ testOnly: true })}`
      : '#';

  // --- PDF Generation Logic ---
  const handleGeneratePdf = () => {
    console.log("Generate PDF clicked for invoice:", invoice.id);
    if (!wallet?.account?.address) {
        toast.error("Wallet not connected.");
        return;
    }

    const pdfToastId = toast.loading("Generating PDF...");

    try {
        // 1. Get Freelancer Address
        const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });

        // 2. Generate Payment Link using robust conversion
        const amountString = invoice.amount.toFixed(9); // Ensure decimal string
        const amountInNanoTon = toNano(amountString);
        const paymentLink = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

        // 3. Get QR Code Image Data
        const qrCanvasElement = document.getElementById(`qr-${invoice.id}`) as HTMLCanvasElement;
        if (qrCanvasElement) {
             const qrDataURL = qrCanvasElement.toDataURL('image/png');

             // 4. Create jsPDF instance
             const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
             const leftMargin = 15;
             const rightMargin = doc.internal.pageSize.getWidth() - leftMargin;
             let currentY = 20;

             // --- Add Content to PDF (Layout details omitted for brevity, ensure they are correct) ---
             doc.setFontSize(18); doc.text("Invoice", 105, currentY, { align: 'center' }); currentY += 15;
             doc.setFontSize(10); doc.text(`Invoice ID: ${invoice.id}`, leftMargin, currentY); doc.text(`Date: ${new Date(invoice.timestamp).toLocaleDateString()}`, rightMargin, currentY, { align: 'right'}); currentY += 15;
             doc.text("From:", leftMargin, currentY); currentY += 5; doc.text("TON PayLink User", leftMargin, currentY); currentY += 4; doc.text(freelancerAddress, leftMargin, currentY, { maxWidth: 80 }); currentY -= 9;
             doc.text("To:", rightMargin - 80, currentY); currentY += 5; doc.text("Client Name/Business", rightMargin - 80, currentY); currentY += 15;
             doc.setFontSize(12); doc.setTextColor(100); doc.text("Description", leftMargin, currentY); doc.text("Amount (TON)", rightMargin, currentY, { align: 'right' }); doc.setTextColor(0); currentY += 2; doc.setDrawColor(200); doc.line(leftMargin, currentY, rightMargin, currentY); currentY += 7;
             doc.setFontSize(10); const descriptionLines = doc.splitTextToSize(invoice.description, 140); doc.text(descriptionLines, leftMargin, currentY); doc.text(invoice.amount.toFixed(4), rightMargin, currentY, { align: 'right' }); currentY += (descriptionLines.length * 4) + 10;
             doc.line(leftMargin, currentY, rightMargin, currentY); currentY += 10;
             doc.setFontSize(14); doc.text(`Total: ${invoice.amount.toFixed(4)} TON`, rightMargin, currentY, { align: 'right' }); currentY += 20;
             doc.setFontSize(12); doc.text("Payment Instructions:", leftMargin, currentY); currentY += 7; doc.setFontSize(10); doc.text("Scan QR or use link below.", leftMargin, currentY, { maxWidth: rightMargin - leftMargin - 60 }); currentY += 7; doc.setTextColor(0, 0, 255); doc.textWithLink("Clickable Payment Link", leftMargin, currentY, { url: paymentLink }); currentY += 5; doc.setTextColor(0, 0, 0); doc.setFontSize(8); doc.text(paymentLink, leftMargin, currentY, { maxWidth: 100 });
             doc.addImage(qrDataURL, 'PNG', rightMargin - 55, currentY - 10, 50, 50);

             // 6. Trigger Download
             doc.save(`invoice-${invoice.id}.pdf`);
             toast.dismiss(pdfToastId);
             toast.success("Invoice PDF downloading...");

        } else {
             console.error("Could not find QR canvas element. ID:", `qr-${invoice.id}`);
             toast.dismiss(pdfToastId);
             toast.error("Error generating QR code for PDF.");
        }

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.dismiss(pdfToastId);
        toast.error("Failed to generate PDF invoice.");
    }
  };
  // --- End PDF Logic ---

  // --- JSX Rendering ---
  return (
    <div className="invoice-card">
      {/* Card Content Rows */}
      <div className="card-row">
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          {/* Call helper function for status class */}
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
          <a href={tonscanLink} target="_blank" rel="noopener noreferrer" className="tonscan-link" title="View Owner on Explorer">🔗</a>
        </div>
      </div>
      <div className="card-row details">
         {/* Display amount with 2 decimals */}
        <span className="amount">${invoice.amount.toFixed(2)}</span>
         {/* Call helper function for timestamp format */}
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      {/* Card Actions */}
      <div className="card-actions">
        <button onClick={handleGeneratePdf} className="pdf-button" title="Generate PDF">📄 PDF</button>
        {/* Ensure onDelete is called correctly */}
        <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">🗑️</button>
      </div>

      {/* Hidden Canvas for QR Code Generation */}
      {(() => {
           if (!wallet?.account?.address) return null;
           const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });
           // **Robust amount conversion**
           const amountString = invoice.amount.toFixed(9);
           const amountInNanoTon = toNano(amountString);
           const paymentLinkValue = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

           return (
               <QRCodeCanvas
                   id={`qr-${invoice.id}`} // Unique ID
                   value={paymentLinkValue}
                   size={256} level={"H"} includeMargin={true}
                   style={{ display: 'none' }} // Keep hidden
               />
           );
       })()}
    </div>
  );
}