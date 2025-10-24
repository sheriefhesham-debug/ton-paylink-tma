import type { Invoice } from './InvoiceForm';
import './invoiceCard.css';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core'; // Ensure toNano is imported if used here, or Address if needed elsewhere
import jsPDF from 'jspdf'; 
import { QRCodeCanvas } from 'qrcode.react'; 
import toast from 'react-hot-toast'; 

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

    try {
        // 1. Get Freelancer Address
        const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });

        // 2. Generate Payment Link
        const amountInNanoTon = toNano(invoice.amount.toString());
        const paymentLink = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;

        // 3. Get QR Code Image Data
        const qrCanvasElement = document.getElementById(`qr-${invoice.id}`) as HTMLCanvasElement;
        if (qrCanvasElement) {
             const qrDataURL = qrCanvasElement.toDataURL('image/png');

             // 4. Create jsPDF instance
             const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
             let currentY = 20; 

             // --- Add Content to PDF ---
             doc.setFontSize(18);
             doc.text("Invoice", doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
             currentY += 15;
             // ... (rest of PDF content generation) ...
             doc.setFontSize(10);
             doc.text(`Invoice ID: ${invoice.id}`, 15, currentY);
             doc.text(`Date: ${new Date(invoice.timestamp).toLocaleDateString()}`, 195, currentY, { align: 'right'});
             currentY += 15; // Space for From/To
             doc.text("From:", 15, currentY); currentY += 5;
             doc.text("Freelancer Name/Business", 15, currentY); currentY += 5;
             doc.text(freelancerAddress, 15, currentY, { maxWidth: 80 });
             currentY -= 10; // Reset Y for 'To'
             doc.text("To:", 195, currentY, { align: 'right'}); currentY += 5;
             doc.text("Client Name/Business", 195, currentY, { align: 'right'}); currentY += 15;
             doc.setFontSize(12);
             doc.text("Description", 15, currentY);
             doc.text("Amount (TON)", 195, currentY, { align: 'right' });
             currentY += 2; doc.line(15, currentY, 195, currentY); currentY += 7;
             doc.setFontSize(10);
             const descriptionLines = doc.splitTextToSize(invoice.description, 140); 
             doc.text(descriptionLines, 15, currentY);
             doc.text(invoice.amount.toFixed(4), 195, currentY, { align: 'right' }); 
             currentY += (descriptionLines.length * 4) + 10; 
             doc.line(15, currentY, 195, currentY); currentY += 10;
             doc.setFontSize(14);
             doc.text(`Total: ${invoice.amount.toFixed(4)} TON`, 195, currentY, { align: 'right' });
             currentY += 20;
             doc.setFontSize(12);
             doc.text("Payment Instructions:", 15, currentY); currentY += 7;
             doc.setFontSize(10);
             doc.text("Scan the QR code or use the link below with a TON wallet (e.g., Tonkeeper).", 15, currentY); currentY += 7;
             doc.setTextColor(0, 0, 255);
             doc.textWithLink("Clickable Payment Link", 15, currentY, { url: paymentLink }); currentY += 5;
             doc.setTextColor(0, 0, 0);
             doc.setFontSize(8);
             doc.text(paymentLink, 15, currentY, { maxWidth: 100 }); 
             doc.addImage(qrDataURL, 'PNG', 195 - 50, currentY - 5, 50, 50);

             // 6. Trigger Download
             doc.save(`invoice-${invoice.id}.pdf`);
             toast.success("Invoice PDF downloading...");

        } else {
             console.error("Could not find QR canvas element. ID:", `qr-${invoice.id}`);
             toast.error("Error generating QR code for PDF.");
        }

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF invoice.");
    }
  };
  // --- End PDF Generation Logic ---


  // --- JSX Rendering ---
  return (
    <div className="invoice-card">
      <div className="card-row">
        {/* Make sure invoice.description is used */}
        <span className="description">{invoice.description}</span>
        <div className="status-and-link">
          {/* Make sure getStatusClass(invoice.status) is called */}
          <span className={`status-badge ${getStatusClass(invoice.status)}`}>
            {invoice.status}
          </span>
          <a href={tonscanLink} target="_blank" rel="noopener noreferrer" className="tonscan-link" title="View Owner on Explorer">🔗</a>
        </div>
      </div>
      <div className="card-row details">
        <span className="amount">${invoice.amount.toFixed(2)}</span>
         {/* Make sure formatTimestamp(invoice.timestamp) is called */}
        <span className="timestamp">{formatTimestamp(invoice.timestamp)}</span>
      </div>
      <div className="card-actions">
          <button onClick={handleGeneratePdf} className="pdf-button" title="Generate PDF">
              📄 PDF
          </button>
          {/* Make sure onDelete is only called here */}
          <button onClick={() => onDelete(invoice.id)} className="delete-button" title="Delete Record">
            🗑️
          </button>
      </div>

      {/* Hidden Canvas for QR Code Generation */}
      {(() => {
           if (!wallet?.account?.address) return null;
           const freelancerAddress = Address.parse(wallet.account.address).toString({ testOnly: true });
           const amountInNanoTon = toNano(invoice.amount.toString());
           const paymentLinkValue = `ton://transfer/${freelancerAddress}?amount=${amountInNanoTon.toString()}&text=${invoice.id}`;
           return (
               <QRCodeCanvas
                   id={`qr-${invoice.id}`}
                   value={paymentLinkValue}
                   size={256}
                   level={"H"}
                   includeMargin={true}
                   style={{ display: 'none' }}
               />
           );
       })()}
    </div>
  );
}