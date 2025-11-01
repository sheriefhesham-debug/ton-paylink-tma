import './dashboard.css';
import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import type { Invoice } from './InvoiceForm';
import { InvoiceCard } from './InvoiceCard';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// Define props for Dashboard, including the new function
interface DashboardProps {
  onShowPayment: (invoice: Invoice) => void;
}

export function Dashboard({ onShowPayment }: DashboardProps) { // Accept the prop
    const wallet = useTonWallet();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect for loading (remains the same)
    useEffect(() => {
        // ... (Keep the existing useEffect logic) ...
        if (wallet?.account?.address) {
            setIsLoading(true);
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
            } catch (error) { setInvoices([]); console.error("Error loading invoices:", error); }
            finally { setIsLoading(false); }
        } else { setInvoices([]); setIsLoading(false); }
    }, [wallet]);

    // Delete Function (remains the same)
    const handleDeleteInvoice = (idToDelete: string) => { /* ... (Keep as before) ... */ };

    // CSV Export Function (remains the same)
    const handleExportCsv = () => { /* ... (Keep as before) ... */ };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">My Invoices</h2>
                {invoices.length > 0 && !isLoading && (
                    <button onClick={handleExportCsv} className="export-button">
                        Export CSV
                    </button>
                )}
            </div>

            <div className="invoice-list">
                {isLoading ? ( <p className="loading-message">Loading invoices...</p> )
                 : invoices.length === 0 ? ( <p className="empty-message">No invoices recorded yet.</p> )
                 : (
                    invoices.map((invoice) => (
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onDelete={handleDeleteInvoice}
                            onShowPayment={onShowPayment} // <-- Pass the function to the card
                        />
                    ))
                )}
            </div>
        </div>
    );
}