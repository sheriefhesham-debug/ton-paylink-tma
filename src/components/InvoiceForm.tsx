import './InvoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
// Import Address and beginCell along with toNano
import { Address, beginCell, toNano } from '@ton/core';

// Define a type for our invoice structure
// Export it so other components like Dashboard can use it
export interface Invoice {
    id: string;
    amount: number;
    description: string;
    status: 'Pending' | 'Paid'; // Use string literals for status
    txHash?: string; // Transaction hash (optional for now)
    timestamp: number; // When the invoice was created
}

export function InvoiceForm() {
    // State for form inputs
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hooks for wallet interaction
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const handleGenerateLink = async () => {
        if (!wallet) {
             console.error("Wallet not connected!");
             alert("Please connect your wallet first.");
             return;
         }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !description.trim()) {
             alert("Please enter a valid amount and description.");
             return;
         }

        setIsLoading(true);
        console.log("--- Generating Link & Recording On-Chain ---");

        let userFriendlyAddress = ''; // Define outside try block

        try {
            // --- Format Invoice Data for Memo ---
            const invoiceData = {
                type: "TONPayLinkInvoice_v1",
                amount: numericAmount,
                desc: description.trim(),
                status: "pending"
            };
            const memoText = JSON.stringify(invoiceData);
            console.log("Memo Text:", memoText);

            // --- Memo Length Check ---
            const maxMemoTextLength = 100; // Be conservative
            if (memoText.length > maxMemoTextLength) {
                 alert(`Description/Data is too long for the on-chain memo (max ~${maxMemoTextLength} chars in JSON). Please shorten it.`);
                 setIsLoading(false);
                 return;
             }

            // --- Convert Address Format ---
            const rawAddressString = wallet.account.address;
            console.log("Wallet Hook Raw Address:", rawAddressString);
            const addressObject = Address.parse(rawAddressString);
            userFriendlyAddress = addressObject.toString({ testOnly: true }); // Assign value here
            console.log("Converted User-Friendly Address:", userFriendlyAddress);

            // --- Build and Encode Comment Cell for Payload ---
            const commentCell = beginCell()
                .storeUint(0, 32) // op-code for comment
                .storeStringTail(memoText)
                .endCell();
            const payloadBase64 = commentCell.toBoc().toString('base64');
            console.log("Payload (Base64 Encoded Comment Cell):", payloadBase64);

            // --- Prepare the Transaction ---
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [ { address: userFriendlyAddress, amount: toNano('0.005').toString(), payload: payloadBase64 } ]
            };
            console.log("Transaction Message Address:", transaction.messages[0].address);
            console.log("Transaction Message Payload:", transaction.messages[0].payload);

            // --- Send Transaction via TON Connect UI ---
            console.log("--- Sending transaction request to wallet... ---");
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log("--- Transaction sent! Signed BOC:", result.boc);

             // --- SAVE TO LOCAL STORAGE (On successful send attempt) ---
             try {
                // 1. Create the new invoice object
                const newInvoice: Invoice = {
                    id: `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`, // Simple unique ID
                    amount: numericAmount,
                    description: description.trim(),
                    status: 'Pending', // Assume pending until confirmed otherwise
                    // txHash: Maybe parse hash from result.boc later? Or poll API.
                    timestamp: Date.now()
                };

                // 2. Get existing invoices (or empty array), using the CORRECT address format
                const storageKey = `invoices_${userFriendlyAddress}`; // Use the converted address
                const existingInvoicesRaw = localStorage.getItem(storageKey);
                const existingInvoices: Invoice[] = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];

                // 3. Add the new invoice (prepend to show newest first)
                existingInvoices.unshift(newInvoice);

                // 4. Save back to Local Storage
                localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
                console.log("--- Invoice saved to Local Storage ---", newInvoice);

            } catch (storageError) {
                console.error("--- Failed to save invoice to Local Storage ---", storageError);
                // Don't block the user, but log the error
            }
            // --- END SAVE ---

            alert("Invoice Recorded! (Check wallet history)"); // User feedback

            // Clear form
            setAmount('');
            setDescription('');

        } catch (error) {
            console.error("--- Transaction failed! ---", error);
            alert("Failed to record invoice on-chain. Did you approve the transaction in your wallet? See console for details.");
        } finally {
            setIsLoading(false); // Ensure loading state is turned off
        }
    };

    // --- JSX for Rendering the Form ---
    return (
         <div className="invoice-form">
            <Input label="Amount (USD)" type="number" placeholder="e.g., 150" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Description" type="text" placeholder="e.g., Logo design for project X" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button text={isLoading ? "Recording..." : "Generate Link"} onClick={handleGenerateLink} />
        </div>
    );
}

// Export the Invoice interface so Dashboard can use it
// No default export needed if App.tsx imports it directly like: import { InvoiceForm } from ...