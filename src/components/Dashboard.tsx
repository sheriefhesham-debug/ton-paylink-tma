import './dashboard.css';
import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import type { Invoice } from './InvoiceForm';
import { InvoiceCard } from './InvoiceCard';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// --- 1. Define the props interface for Dashboard ---
interface DashboardProps {
  onShowPayment: (invoice: Invoice) => void;
}

// --- 2. Accept the props in the function ---
export function Dashboard({ onShowPayment }: DashboardProps) {
    const wallet = useTonWallet();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect for loading invoices (remains the same)
    useEffect(() => {
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

    // --- Delete Function (remains the same) ---
    const handleDeleteInvoice = (idToDelete: string) => {
        const updatedInvoices = invoices.filter(invoice => invoice.id !== idToDelete);
        setInvoices(updatedInvoices); 
        if (wallet?.account?.address) {
            try {
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                const storageKey = `invoices_${userFriendlyAddress}`;
                if (updatedInvoices.length > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(updatedInvoices));
                } else {
                    localStorage.removeItem(storageKey); 
                }
                toast.success("Invoice record deleted.");
            } catch (error) {
                console.error("Dashboard: Failed to update Local Storage after deletion", error);
                toast.error("Failed to delete invoice record.");
            }
        }
    };

    // --- CSV Export Function (remains the same) ---
    const handleExportCsv = () => {
        if (invoices.length === 0) { toast.error("No invoices to export."); return; }
        try {
            const csvData = invoices.map(inv => ({
                ID: inv.id,
                Date: new Date(inv.timestamp).toISOString().split('T')[0],
                Time: new Date(inv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                Description: inv.description,
                Amount_USD: inv.amount,
                Amount_TON: inv.tonAmount || 'N/A',
                Status: inv.status,
            }));
            const csvString = Papa.unparse(csvData);
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'ton-paylink-invoices.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("CSV file downloading...");
        } catch (downloadError) {
             console.error("--- CSV Download Failed ---", downloadError);
             toast.error("Failed to download CSV.");
        }
    };

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
                            onShowPayment={onShowPayment} // <-- This prop is now correctly accepted
                        />
                    ))
                )}
            </div>
        </div>
    );
}