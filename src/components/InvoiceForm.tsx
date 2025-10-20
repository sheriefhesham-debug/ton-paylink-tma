import './invoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
// Corrected import: Removed unused 'Cell' type
import { Address, beginCell, toNano } from '@ton/core'; 

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

        // ... (Input validation logic remains the same) ...
        const numericAmount = parseFloat(amount);
         if (isNaN(numericAmount) || numericAmount <= 0 || !description.trim()) {
              alert("Please enter a valid amount and description.");
              return;
          }

        setIsLoading(true); 
        console.log("--- Generating Link & Recording On-Chain ---"); 
        // ... (Log amount/description) ...

        try {
            // ... (Memo formatting logic remains the same) ...
            const invoiceData = { type: "TONPayLinkInvoice_v1", amount: numericAmount, desc: description.trim(), status: "pending" }; 
            const memoText = JSON.stringify(invoiceData); 
            console.log("Memo Text:", memoText);
            // Memo length check...
             if (memoText.length > 120) { /* ... handle error ... */ setIsLoading(false); return; }

            // --- Convert Address Format ---
            const rawAddressString = wallet.account.address; 
            const addressObject = Address.parse(rawAddressString);
            const userFriendlyAddress = addressObject.toString({ testOnly: true }); 
            console.log("Converted User-Friendly Address:", userFriendlyAddress); 

            // --- Build and Encode Comment Cell for Payload ---
            const commentCell = beginCell()
                .storeUint(0, 32) // op-code for comment
                .storeStringTail(memoText) // Store the actual text memo
                .endCell();
            const payloadBase64 = commentCell.toBoc().toString('base64');
            console.log("Payload (Base64 Encoded Comment Cell):", payloadBase64);

            // Prepare the Transaction (Send to Self with Encoded Payload)
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

            // Send Transaction via TON Connect UI
            console.log("--- Sending transaction request to wallet... ---");
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log("--- Transaction sent! ---", result.boc); 

            alert("Invoice Recorded! (Check wallet history)"); 
            
            setAmount('');
            setDescription('');

        } catch (error) {
            console.error("--- Transaction failed! ---", error); 
            alert("Failed to record invoice on-chain. See console for details.");
        } finally {
            setIsLoading(false); 
        }
    };

    return (
         <div className="invoice-form">
            {/* Input fields remain the same */}
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
            {/* Button remains the same */}
             <Button
                text={isLoading ? "Generating..." : "Generate Link"} 
                onClick={handleGenerateLink} 
            />
        </div>
    );
}