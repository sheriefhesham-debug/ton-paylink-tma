import './InvoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import toast from 'react-hot-toast'; // <-- 1. Import toast

export interface Invoice { /* ... Interface remains the same ... */
    id: string;
    amount: number;
    description: string;
    status: 'Pending' | 'Paid';
    txHash?: string;
    timestamp: number;
}

export function InvoiceForm() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Still useful for button state

    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const handleGenerateLink = async () => {
        // --- Input Validation with Toasts ---
        if (!wallet) {
            console.error("Wallet not connected!");
            toast.error("Please connect your wallet first."); // Use toast.error
            return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !description.trim()) {
            toast.error("Please enter a valid amount and description."); // Use toast.error
            return;
        }

        // --- Memo Length Check with Toast ---
        const invoiceData = { type: "TONPayLinkInvoice_v1", amount: numericAmount, desc: description.trim(), status: "pending" };
        const memoText = JSON.stringify(invoiceData);
        const maxMemoTextLength = 100;
        if (memoText.length > maxMemoTextLength) {
            toast.error(`Description/Data too long for memo (max ~${maxMemoTextLength} chars).`); // Use toast.error
             return;
         }

        // --- Prepare Transaction ---
        setIsLoading(true); // Keep for button text change
        console.log("--- Preparing transaction ---");
        let userFriendlyAddress = '';
        let transaction: Parameters<typeof tonConnectUI.sendTransaction>[0] | null = null;
        try {
            const rawAddressString = wallet.account.address;
            const addressObject = Address.parse(rawAddressString);
            userFriendlyAddress = addressObject.toString({ testOnly: true });
            const commentCell = beginCell().storeUint(0, 32).storeStringTail(memoText).endCell();
            const payloadBase64 = commentCell.toBoc().toString('base64');

            transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [ { address: userFriendlyAddress, amount: toNano('0.005').toString(), payload: payloadBase64 } ]
            };
             console.log("Transaction prepared:", transaction);

        } catch (prepError) {
             console.error("--- Failed to prepare transaction ---", prepError);
             toast.error("Error preparing transaction. See console.");
             setIsLoading(false);
             return;
         }


        // --- Send Transaction using toast.promise ---
        console.log("--- Sending transaction request to wallet... ---");
        const sendPromise = tonConnectUI.sendTransaction(transaction);

        toast.promise(
            sendPromise,
            {
                loading: 'Sending transaction...', // Message shown while waiting
                success: (result) => { // Function runs on success
                    console.log("--- Transaction sent! Signed BOC:", result.boc);

                    // --- SAVE TO LOCAL STORAGE (On success) ---
                    try {
                        const newInvoice: Invoice = {
                             id: `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                             amount: numericAmount, description: description.trim(),
                             status: 'Pending', timestamp: Date.now()
                         };
                        const storageKey = `invoices_${userFriendlyAddress}`;
                        const existingInvoicesRaw = localStorage.getItem(storageKey);
                        const existingInvoices: Invoice[] = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];
                        existingInvoices.unshift(newInvoice);
                        localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
                        console.log("--- Invoice saved to Local Storage ---", newInvoice);
                    } catch (storageError) { /* ... handle storage error ... */ }

                    // Clear form on success
                    setAmount('');
                    setDescription('');
                    setIsLoading(false); // Stop loading state on success

                    return 'Invoice Recorded!'; // Success message for the toast
                },
                error: (err) => { // Function runs on error
                    console.error("--- Transaction failed! ---", err);
                    setIsLoading(false); // Stop loading state on error
                    // Provide a more specific error message if possible
                    if (err instanceof Error && err.message.includes('UserRejectsError')) {
                        return 'Transaction rejected in wallet.';
                    }
                    return 'Transaction failed. Please try again.'; // Error message for the toast
                }
            }
        );
        // We set isLoading to false inside the success/error handlers now
    };

    // --- JSX for Rendering the Form ---
    return (
         <div className="invoice-form">
            <Input label="Amount (USD)" type="number" placeholder="e.g., 150" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Description" type="text" placeholder="e.g., Logo design for project X" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button
                text={isLoading ? "Recording..." : "Generate Link"}
                onClick={handleGenerateLink}
                // Optionally disable button while toast promise is pending (isLoading)
                // disabled={isLoading} 
            />
        </div>
    );
}