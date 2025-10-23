import './dashboard.css';
import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import type { Invoice } from './InvoiceForm';
import { InvoiceCard } from './InvoiceCard';
import Papa from 'papaparse'; // Keep PapaParse import

export function Dashboard() {
    const wallet = useTonWallet();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect for loading invoices remains the same...
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
            } catch (error) { setInvoices([]); console.error("Error loading invoices:", error); } // Added console log
            finally { setIsLoading(false); }
        } else { setInvoices([]); setIsLoading(false); }
    }, [wallet]);

    // --- Delete Function ---
    const handleDeleteInvoice = (idToDelete: string) => {
        console.log("Dashboard: Deleting invoice with ID:", idToDelete);
        const updatedInvoices = invoices.filter(invoice => invoice.id !== idToDelete);
        setInvoices(updatedInvoices); // Update state

        // Update Local Storage
        if (wallet?.account?.address) {
            try {
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                const storageKey = `invoices_${userFriendlyAddress}`;
                if (updatedInvoices.length > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(updatedInvoices));
                } else {
                    localStorage.removeItem(storageKey); // Remove key if list is empty
                }
                console.log("Dashboard: Updated Local Storage after deletion.");
                // Optional: Add a success toast here
            } catch (error) {
                console.error("Dashboard: Failed to update Local Storage after deletion", error);
                // Optional: Add an error toast here
            }
        }
    };
    // --- End Delete Function ---


    // --- CSV Export Function ---
    const handleExportCsv = () => {
        if (invoices.length === 0) {
            alert("No invoices to export."); // Replace with toast later
            return;
        }
        console.log("--- Exporting Invoices to CSV ---");
        const csvData = invoices.map(inv => ({
            ID: inv.id,
            Date: new Date(inv.timestamp).toISOString().split('T')[0],
            Time: new Date(inv.timestamp).toLocaleTimeString(),
            Description: inv.description,
            Amount: inv.amount,
            Status: inv.status,
            TxHash: inv.txHash || '',
        }));
        const csvString = Papa.unparse(csvData);
        try {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'ton-paylink-invoices.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("CSV download triggered");
        } catch (downloadError) {
             console.error("--- CSV Download Failed ---", downloadError);
             alert("Failed to download CSV. See console for details."); // Replace with toast
        }
    };
    // --- End CSV Export Function ---

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">My Invoices</h2>
                {invoices.length > 0 && (
                    <button onClick={handleExportCsv} className="export-button">
                        Export CSV
                    </button>
                )}
            </div>

            <div className="invoice-list">
                {isLoading ? (
                    <p className="loading-message">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                    <p className="empty-message">No invoices recorded yet.</p>
                ) : (
                    invoices.map((invoice) => (
                        // **FIX: Pass the onDelete function down**
                        <InvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onDelete={handleDeleteInvoice} // <-- Added this prop
                        />
                    ))
                )}
            </div>
        </div>
    );
}