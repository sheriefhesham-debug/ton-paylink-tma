import './dashboard.css';
import { useState, useEffect } from 'react'; // Import hooks
import { useTonWallet } from '@tonconnect/ui-react'; // Import wallet hook
import { Address } from '@ton/core'; // Import Address for parsing/formatting
// Corrected Import: Use 'import type' for the interface
import type { Invoice } from './InvoiceForm';
// Make sure InvoiceCard is correctly imported
import { InvoiceCard } from './InvoiceCard';

export function Dashboard() {
    const wallet = useTonWallet();
    // State to hold the invoices read from storage
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // useEffect runs when the component mounts and when 'wallet' changes
    useEffect(() => {
        // Only attempt to load if a wallet object AND address exist
        if (wallet?.account?.address) {
            setIsLoading(true);
            console.log("Dashboard: Wallet connected, loading invoices...");
            try {
                // Get the raw address and convert to user-friendly format for the key
                const rawAddress = wallet.account.address;
                // Ensure testOnly flag matches your network (true for Testnet)
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                console.log("Dashboard: Using address for key:", userFriendlyAddress);

                const storageKey = `invoices_${userFriendlyAddress}`; // Use the same key format as saving
                console.log("Dashboard: Attempting to read from key:", storageKey);

                const storedInvoicesRaw = localStorage.getItem(storageKey);
                console.log("Dashboard: Raw data from storage:", storedInvoicesRaw);

                let storedInvoices: Invoice[] = [];
                if (storedInvoicesRaw) {
                    try {
                        storedInvoices = JSON.parse(storedInvoicesRaw);
                        // Validate that it's an array
                        if (!Array.isArray(storedInvoices)) {
                            console.error("Dashboard: Parsed data is not an array!", storedInvoices);
                            storedInvoices = []; // Reset to empty if data is invalid
                        }
                         // Sort invoices by timestamp, newest first
                         storedInvoices.sort((a, b) => b.timestamp - a.timestamp);
                    } catch (parseError) {
                        console.error("Dashboard: Failed to parse JSON from Local Storage", parseError, storedInvoicesRaw);
                        storedInvoices = []; // Reset on error
                    }
                } else {
                    console.log("Dashboard: No data found in Local Storage for this key.");
                }

                setInvoices(storedInvoices);
                console.log(`Dashboard: Set ${storedInvoices.length} invoices in state.`);
            } catch (error) {
                console.error("Dashboard: Failed to load invoices from Local Storage", error);
                setInvoices([]); // Set empty array on error
            } finally {
                 setIsLoading(false);
            }
        } else {
             // Handle case where wallet disconnects or isn't fully loaded yet
             console.log("Dashboard: Wallet disconnected or address not available, clearing invoices.");
             setInvoices([]);
             setIsLoading(false);
        }
    }, [wallet]); // Dependency array: run effect when 'wallet' object changes

    return (
        <div className="dashboard-container">
            {/* Title remains */}
            <h2 className="dashboard-title">My Invoices</h2>

            {/* Invoice List Area */}
            <div className="invoice-list">
                {/* Show loading message */}
                {isLoading ? (
                    <p className="loading-message">Loading invoices...</p>
                /* Show empty message if not loading and no invoices */
                ) : invoices.length === 0 ? (
                    <p className="empty-message">No invoices recorded yet.</p>
                /* Map over invoices and render InvoiceCard if not loading and invoices exist */
                ) : (
                    invoices.map((invoice) => (
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))
                )}
            </div>
        </div>
    );
}

// Make sure InvoiceCard.tsx also has 'export function InvoiceCard ...'