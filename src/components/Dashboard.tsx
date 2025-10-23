import './dashboard.css';
import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import type { Invoice } from './InvoiceForm';
import { InvoiceCard } from './InvoiceCard';
import Papa from 'papaparse'; // <-- Import PapaParse

export function Dashboard() {
    const wallet = useTonWallet();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect for loading invoices remains the same...
    useEffect(() => {
        if (wallet?.account?.address) {
            setIsLoading(true);
            // ... (rest of the loading logic from previous step) ...
            try {
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                const storageKey = `invoices_${userFriendlyAddress}`;
                const storedInvoicesRaw = localStorage.getItem(storageKey);
                let storedInvoices: Invoice[] = [];
                if (storedInvoicesRaw) {
                    try {
                        storedInvoices = JSON.parse(storedInvoicesRaw);
                        if (!Array.isArray(storedInvoices)) storedInvoices = [];
                         storedInvoices.sort((a, b) => b.timestamp - a.timestamp);
                    } catch { storedInvoices = []; }
                }
                setInvoices(storedInvoices);
            } catch (error) { setInvoices([]); console.error(error); }
            finally { setIsLoading(false); }
        } else { setInvoices([]); setIsLoading(false); }
    }, [wallet]);

    // --- CSV Export Function ---
    const handleExportCsv = () => {
        if (invoices.length === 0) {
            // Optional: Show a toast notification if there's nothing to export
            alert("No invoices to export."); // Replace with toast later
            return;
        }

        console.log("--- Exporting Invoices to CSV ---");

        // 1. Prepare data for CSV (select and format fields)
        const csvData = invoices.map(inv => ({
            ID: inv.id,
            // Format timestamp into a readable date string
            Date: new Date(inv.timestamp).toISOString().split('T')[0], // YYYY-MM-DD
            Time: new Date(inv.timestamp).toLocaleTimeString(), // HH:MM:SS
            Description: inv.description,
            Amount: inv.amount,
            Status: inv.status,
            TxHash: inv.txHash || '', // Include TxHash if available
        }));

        // 2. Convert JSON data to CSV string using PapaParse
        const csvString = Papa.unparse(csvData);
        console.log("CSV String generated");

        // 3. Trigger file download
        try {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) { // Check for browser support
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'ton-paylink-invoices.csv'); // Filename
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log("CSV download triggered");
            } else {
                 throw new Error("Browser doesn't support automatic download.");
            }
        } catch (downloadError) {
             console.error("--- CSV Download Failed ---", downloadError);
             alert("Failed to download CSV. See console for details."); // Replace with toast
        }
    };
    // --- End CSV Export Function ---

    return (
        <div className="dashboard-container">
            {/* Header row with Title and Export Button */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">My Invoices</h2>
                {/* Add the Export Button - only show if there are invoices */}
                {invoices.length > 0 && (
                    <button onClick={handleExportCsv} className="export-button">
                        Export CSV
                    </button>
                )}
            </div>

            {/* Invoice List Area remains the same... */}
            <div className="invoice-list">
                {isLoading ? (
                    <p className="loading-message">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                    <p className="empty-message">No invoices recorded yet.</p>
                ) : (
                    invoices.map((invoice) => (
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))
                )}
            </div>
        </div>
    );
}