import './dashboard.css';
import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import type { Invoice } from './InvoiceForm';
import { InvoiceCard } from './InvoiceCard';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export function Dashboard() {
    const wallet = useTonWallet();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("[Dashboard Effect] Triggered. Wallet:", wallet);
        
        // --- DEFINITIVE FIX: Stricter Wallet Check ---
        if (wallet && wallet.account && wallet.account.address) {
            setIsLoading(true);
            console.log("[Dashboard Effect] Wallet connected, loading...");
            try {
                // We know wallet.account.address is a valid string here
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                console.log("[Dashboard Effect] Using address for key:", userFriendlyAddress);
                
                const storageKey = `invoices_${userFriendlyAddress}`;
                console.log("[Dashboard Effect] Reading from key:", storageKey);
                const storedInvoicesRaw = localStorage.getItem(storageKey);
                console.log("[Dashboard Effect] Raw data:", storedInvoicesRaw);
                
                let storedInvoices: Invoice[] = [];
                if (storedInvoicesRaw) {
                    console.log("[Dashboard Effect] Parsing raw data...");
                    try {
                        storedInvoices = JSON.parse(storedInvoicesRaw);
                        if (!Array.isArray(storedInvoices)) {
                            console.error("[Dashboard Effect] Parsed data IS NOT AN ARRAY!");
                            storedInvoices = [];
                        } else {
                            console.log("[Dashboard Effect] Parse SUCCESS. Data:", storedInvoices);
                            storedInvoices.forEach((inv, index) => {
                                console.log(`[Dashboard Effect] Invoice ${index} amount: ${inv.amount} (Type: ${typeof inv.amount})`);
                            });
                            storedInvoices.sort((a, b) => b.timestamp - a.timestamp);
                        }
                    } catch (parseError) {
                        console.error("[Dashboard Effect] JSON Parse FAILED", parseError);
                        storedInvoices = [];
                    }
                } else {
                    console.log("[Dashboard Effect] No data found in storage.");
                }
                setInvoices(storedInvoices);
                console.log(`[Dashboard Effect] Set ${storedInvoices.length} invoices in state.`);
            } catch (error) {
                console.error("[Dashboard Effect] Unexpected loading error", error);
                setInvoices([]);
            } finally {
                 setIsLoading(false);
                 console.log("[Dashboard Effect] Loading finished.");
            }
        } else {
             console.log("[Dashboard Effect] Wallet disconnected/no address, clearing.");
             setInvoices([]);
             setIsLoading(false);
        }
    }, [wallet]); // Re-run when wallet changes

    const handleDeleteInvoice = (idToDelete: string) => {
        console.log("Dashboard: Deleting invoice with ID:", idToDelete);
        const updatedInvoices = invoices.filter(invoice => invoice.id !== idToDelete);
        setInvoices(updatedInvoices); 

        // --- DEFINITIVE FIX: Stricter Wallet Check ---
        if (wallet && wallet.account && wallet.account.address) {
            try {
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                const storageKey = `invoices_${userFriendlyAddress}`;
                if (updatedInvoices.length > 0) {
                    localStorage.setItem(storageKey, JSON.stringify(updatedInvoices));
                } else {
                    localStorage.removeItem(storageKey); 
                }
                console.log("Dashboard: Updated Local Storage after deletion.");
                toast.success("Invoice record deleted.");
            } catch (error) {
                console.error("Dashboard: Failed to update Local Storage after deletion", error);
                toast.error("Failed to delete invoice record.");
            }
        }
    };

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
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Need to define handleExportCsv
if (!('handleExportCsv' in window)) {
    (window as any).handleExportCsv = (invoices: Invoice[]) => {
        if (invoices.length === 0) {
            toast.error("No invoices to export.");
            return;
        }
        console.log("--- Exporting Invoices to CSV ---");
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
            console.log("CSV download triggered");
            toast.success("CSV file downloading...");
        } catch (downloadError) {
             console.error("--- CSV Download Failed ---", downloadError);
             toast.error("Failed to download CSV.");
        }
    };
}