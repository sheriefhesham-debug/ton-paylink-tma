import './InvoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core'; 

export interface Invoice {
    id: string;
    amount: number;
    description: string;
    status: 'Pending' | 'Paid'; 
    txHash?: string; 
    timestamp: number; 
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
        if (!wallet) { /* ... handle error ... */ return; }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !description.trim()) { /* ... handle error ... */ return; }

        setIsLoading(true); 
        console.log("--- Generating Link & Recording On-Chain ---"); 

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
            
            // --- SIMPLIFIED Memo Length Check ---
            // TON comment cells have limitations. Let's use a safe estimate for the JSON + encoding.
            // ~120 bytes for the text part itself is usually safe.
            const maxMemoTextLength = 100; // Be conservative

            if (memoText.length > maxMemoTextLength) {
                 // Removed the unused baseMemoEncodedSizeEstimate variable
                 alert(`Description/Data is too long for the on-chain memo (max ~${maxMemoTextLength} chars in JSON). Please shorten it.`);
                 setIsLoading(false); 
                 return; 
             }

            // --- Convert Address Format ---
            const rawAddressString = wallet.account.address; 
            const addressObject = Address.parse(rawAddressString);
            const userFriendlyAddress = addressObject.toString({ testOnly: true }); 
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
                messages: [
                    {
                        address: userFriendlyAddress, 
                        amount: toNano('0.005').toString(), 
                        payload: payloadBase64 
                    }
                ]
            };
            console.log("Transaction Message Address:", transaction.messages[0].address); 
            console.log("Transaction Message Payload:", transaction.messages[0].payload); 

            // --- Send Transaction via TON Connect UI ---
            console.log("--- Sending transaction request to wallet... ---");
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log("--- Transaction sent! Signed BOC:", result.boc); 

             // --- SAVE TO LOCAL STORAGE ---
             try {
                const newInvoice: Invoice = {
                    id: `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`, 
                    amount: numericAmount,
                    description: description.trim(),
                    status: 'Pending', 
                    timestamp: Date.now()
                };
                const storageKey = `invoices_${userFriendlyAddress}`; 
                const existingInvoicesRaw = localStorage.getItem(storageKey);
                const existingInvoices: Invoice[] = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];
                existingInvoices.unshift(newInvoice); 
                localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
                console.log("--- Invoice saved to Local Storage ---", newInvoice);
            } catch (storageError) {
                console.error("--- Failed to save invoice to Local Storage ---", storageError);
            }
            // --- END SAVE ---

            alert("Invoice Recorded! (Check wallet history)"); 
            
            setAmount('');
            setDescription('');

        } catch (error) {
            console.error("--- Transaction failed! ---", error); 
            alert("Failed to record invoice on-chain. Did you approve the transaction in your wallet? See console for details.");
        } finally {
            setIsLoading(false); 
        }
    };

    // --- JSX for Rendering the Form ---
    return (
         <div className="invoice-form">
            <Input
                label="Amount (USD)" 
                type="number"
                placeholder="e.g., 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <Input
                label="Description"
                type="text"
                placeholder="e.g., Logo design for project X"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button
                text={isLoading ? "Recording..." : "Generate Link"} 
                onClick={handleGenerateLink} 
                // disabled={isLoading} 
            />
        </div>
    );
}