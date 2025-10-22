import './dashboard.css';
import { useState, useEffect } from 'react'; // Import hooks
import { useTonWallet } from '@tonconnect/ui-react'; // Import wallet hook
// Corrected Import: Use 'import type' for the interface
import type { Invoice } from './InvoiceForm'; 
// import { InvoiceCard } from './InvoiceCard'; // We'll add this later

export function Dashboard() {
    const wallet = useTonWallet();
    // State to hold the invoices read from storage
    const [invoices, setInvoices] = useState<Invoice[]>([]); 
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // useEffect runs when the component mounts and when 'wallet' changes
    useEffect(() => {
        if (wallet) {
            setIsLoading(true);
            console.log("Dashboard: Wallet connected, loading invoices...");
            try {
                // Construct the key using the connected wallet's address
                // Use the user-friendly address for the storage key
                const storageKey = `invoices_${wallet.account.address}`; 
                const storedInvoicesRaw = localStorage.getItem(storageKey);
                const storedInvoices: Invoice[] = storedInvoicesRaw ? JSON.parse(storedInvoicesRaw) : [];
                setInvoices(storedInvoices);
                console.log(`Dashboard: Loaded ${storedInvoices.length} invoices from Local Storage.`);
            } catch (error) {
                console.error("Dashboard: Failed to load invoices from Local Storage", error);
                setInvoices([]); // Set empty array on error
            } finally {
                 setIsLoading(false);
            }
        } else {
             console.log("Dashboard: Wallet disconnected, clearing invoices.");
             setInvoices([]); // Clear invoices if wallet disconnects
             setIsLoading(false);
        }
    }, [wallet]); // Dependency array: run effect when 'wallet' changes

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">My Invoices</h2>
            <div className="invoice-list">
                {isLoading ? (
                    <p className="loading-message">Loading invoices...</p> 
                ) : invoices.length === 0 ? (
                    <p className="empty-message">No invoices recorded yet.</p>
                ) : (
                    invoices.map((invoice) => (
                        // Replace placeholder with actual InvoiceCard component later
                        <div key={invoice.id} className="invoice-card-placeholder">
                            <p>{invoice.description}</p>
                            <p>Amount: ${invoice.amount}</p>
                            <p>Status: {invoice.status}</p>
                            {/* Format timestamp nicely */}
                            <p>Created: {new Date(invoice.timestamp).toLocaleString()}</p> 
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}