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
    const [invoices, setInvoices] = useState<Invoice[]>([]); // Initialize as empty array
    const [isLoading, setIsLoading] = useState(true); // Start in loading state

    // useEffect runs when the component mounts and when 'wallet' changes
    useEffect(() => {
        console.log("Dashboard Effect triggered. Wallet:", wallet); // Log 1: Effect start
        // Only attempt to load if a wallet object AND address exist
        if (wallet?.account?.address) {
            setIsLoading(true); // Set loading true when starting fetch
            console.log("Dashboard: Wallet connected, starting invoice load..."); // Log 2: Wallet check passed
            try {
                // Get the raw address and convert to user-friendly format for the key
                const rawAddress = wallet.account.address;
                const userFriendlyAddress = Address.parse(rawAddress).toString({ testOnly: true });
                console.log("Dashboard: Using address for key:", userFriendlyAddress); // Log 3: Address for key

                const storageKey = `invoices_${userFriendlyAddress}`; // Use the same key format as saving
                console.log("Dashboard: Attempting to read from key:", storageKey); // Log 4: Key being read

                const storedInvoicesRaw = localStorage.getItem(storageKey);
                console.log("Dashboard: Raw data from storage:", storedInvoicesRaw); // Log 5: Raw data found

                let storedInvoices: Invoice[] = [];
                if (storedInvoicesRaw) {
                    console.log("Dashboard: Raw data exists, attempting JSON parse..."); // Log 6: Attempt parse
                    try {
                        storedInvoices = JSON.parse(storedInvoicesRaw);
                        // Validate that it's an array
                        if (!Array.isArray(storedInvoices)) {
                            console.error("Dashboard: Parsed data IS NOT AN ARRAY!", storedInvoices); // Log 7a: Parse error (not array)
                            storedInvoices = []; // Reset to empty if data is invalid
                        } else {
                            console.log("Dashboard: JSON Parsed successfully into an array."); // Log 7b: Parse success
                        }
                         // Sort invoices by timestamp, newest first
                         storedInvoices.sort((a, b) => b.timestamp - a.timestamp);
                    } catch (parseError) {
                        console.error("Dashboard: CRITICAL - Failed to parse JSON from Local Storage", parseError, storedInvoicesRaw); // Log 8: Parse failed
                        storedInvoices = []; // Reset on parse error
                    }
                } else {
                    console.log("Dashboard: No data found in Local Storage for this key."); // Log 9: No data found
                }

                setInvoices(storedInvoices); // Update the component's state
                console.log(`Dashboard: Set ${storedInvoices.length} invoices in state. State updated.`); // Log 10: State update call
            } catch (error) {
                console.error("Dashboard: Unexpected error loading invoices", error); // Log 11: General error
                setInvoices([]); // Set empty array on error
            } finally {
                 setIsLoading(false); // Set loading false after attempt
                 console.log("Dashboard: Loading finished."); // Log 12: Loading finished
            }
        } else {
             // Handle case where wallet disconnects or isn't fully loaded yet
             console.log("Dashboard: Wallet disconnected or address not available, clearing invoices."); // Log 13: Wallet disconnected
             setInvoices([]);
             setIsLoading(false);
        }
    }, [wallet]); // Dependency array: run effect when 'wallet' object changes

    console.log("Dashboard Rendering. Current invoices state:", invoices); // Log 14: Render check

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
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))
                )}
            </div>
        </div>
    );
}