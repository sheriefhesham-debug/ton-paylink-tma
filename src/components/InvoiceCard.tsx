import type { Invoice } from './InvoiceForm';
import './InvoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

// ** THE FIX IS HERE: Ensure 'export' keyword is present **
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

  // Construct Tonscan link
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
        const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });
        
        // **Robust amount conversion for PDF link**
        const amountString = invoice.amount.toFixed(9);
        const amountInNanoTon = toNano(amountString);
        const paymentLink = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

        const qrCanvasElement = document.getElementById(`qr-${invoice.id}`) as HTMLCanvasElement;
        if (qrCanvasElement) {
             const qrDataURL = qrCanvasElement.toDataURL('image/png');
             const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
             let currentY = 20;
             doc.setFontSize(18); doc.text("Invoice", 105, currentY, { align: 'center' }); currentY += 15;
             doc.setFontSize(10); doc.text(`Invoice ID: ${invoice.id}`, 15, currentY); doc.text(`Date: ${new Date(invoice.timestamp).toLocaleDateString()}`, 195, currentY, { align: 'right'}); currentY += 15;
             doc.text("From:", 15, currentY); currentY += 5; doc.text("TON PayLink User", 15, currentY); currentY += 4; doc.text(freelancerAddress, 15, currentY, { maxWidth: 80 }); currentY -= 9;
             doc.text("To:", 195 - 80, currentY); currentY += 5; doc.text("Client Name/Business", 195 - 80, currentY); currentY += 15;
             doc.setFontSize(12); doc.setTextColor(100); doc.text("Description", 15, currentY); doc.text("Amount (TON)", 195, currentY, { align: 'right' }); doc.setTextColor(0); currentY += 2; doc.setDrawColor(200); doc.line(15, currentY, 195, currentY); currentY += 7;
             doc.setFontSize(10); const descriptionLines = doc.splitTextToSize(invoice.description, 140); doc.text(descriptionLines, 15, currentY); doc.text(invoice.amount.toFixed(4), 195, currentY, { align: 'right' }); currentY += (descriptionLines.length * 4) + 10;
             doc.line(15, currentY, 195, currentY); currentY += 10;
             doc.setFontSize(14); doc.text(`Total: ${invoice.amount.toFixed(4)} TON`, 195, currentY, { align: 'right' }); currentY += 20;
             doc.setFontSize(12); doc.text("Payment Instructions:", 15, currentY); currentY += 7; doc.setFontSize(10); doc.text("Scan QR or use link below.", 15, currentY, { maxWidth: 195 - 15 - 60 }); currentY += 7; doc.setTextColor(0, 0, 255); doc.textWithLink("Clickable Payment Link", 15, currentY, { url: paymentLink }); currentY += 5; doc.setTextColor(0, 0, 0); doc.setFontSize(8); doc.text(paymentLink, 15, currentY, { maxWidth: 100 });
             doc.addImage(qrDataURL, 'PNG', 195 - 55, currentY - 10, 50, 50);

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
          <button onClick={handleGeneratePdf} className="pdf-button" title="Generate PDF">📄 PDF</button>
          <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">🗑️</button>
      </div>

      {(() => {
           if (!wallet?.account?.address) return null;
           const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });

           // **Robust amount conversion**
           const amountString = invoice.amount.toFixed(9);
           const amountInNanoTon = toNano(amountString);
           const paymentLinkValue = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

           return (
               <QRCodeCanvas
                   id={`qr-${invoice.id}`}
                   value={paymentLinkValue}
                   size={256} level={"H"} includeMargin={true}
                   style={{ display: 'none' }}
               />
           );
       })()}
    </div>
  );
}