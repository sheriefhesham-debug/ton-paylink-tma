import './invoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import toast from 'react-hot-toast';

// Define and EXPORT the Invoice interface
export interface Invoice {
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
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const handleGenerateLink = async () => {
        if (!wallet) { toast.error("Please connect your wallet first."); return; }
        
        const amountInTon = parseFloat(amount);
        if (isNaN(amountInTon) || amountInTon <= 0 || !description.trim()) {
            toast.error("Please enter a valid amount (in TON) and description.");
            return;
        }

        const invoiceData = { type: "TONPayLinkInvoice_v1", amount: amountInTon, desc: description.trim(), status: "pending" };
        const memoText = JSON.stringify(invoiceData);
        const maxMemoTextLength = 100;
        if (memoText.length > maxMemoTextLength) {
            toast.error(`Description/Data too long for memo (max ~${maxMemoTextLength} chars).`);
            return;
        }

        setIsLoading(true);
        setGeneratedLink(null);
        console.log("--- Recording On-Chain & Generating Link ---");

        // **FIX: Changed Date.Now() to Date.now()**
        let newInvoiceId = `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        let userFriendlyAddress = '';

        try {
            const rawAddressString = wallet.account.address;
            const addressObject = Address.parse(rawAddressString);
            userFriendlyAddress = addressObject.toString({ testOnly: true });

            const commentCell = beginCell().storeUint(0, 32).storeStringTail(memoText).endCell();
            const payloadBase64 = commentCell.toBoc().toString('base64');

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [ { address: userFriendlyAddress, amount: toNano('0.005').toString(), payload: payloadBase64 } ]
            };

            const sendPromise = tonConnectUI.sendTransaction(transaction);

            await toast.promise(
                sendPromise,
                {
                    loading: 'Recording invoice...',
                    success: (result) => {
                        console.log("--- Transaction sent! Signed BOC:", result.boc);
                        try {
                            const newInvoice: Invoice = {
                                 id: newInvoiceId,
                                 amount: amountInTon, description: description.trim(),
                                 status: 'Pending', timestamp: Date.now() // Use lowercase 'n' here too
                             };
                            const storageKey = `invoices_${userFriendlyAddress}`;
                            const existingInvoicesRaw = localStorage.getItem(storageKey);
                            const existingInvoices: Invoice[] = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];
                            existingInvoices.unshift(newInvoice);
                            localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
                            console.log("--- Invoice saved to Local Storage ---", newInvoice);

                            const amountInNanoTon = toNano(amountInTon.toString());
                            const paymentLink = `ton://transfer/${userFriendlyAddress}?amount=${amountInNanoTon.toString()}&text=${newInvoice.id}`;
                            setGeneratedLink(paymentLink);
                            console.log("--- Payment Link Generated ---", paymentLink);

                        } catch (storageError) { console.error("--- Failed to save invoice to LS ---", storageError); }

                        setAmount('');
                        setDescription('');
                        return 'Invoice Recorded & Link Ready!';
                    },
                    error: (err) => {
                         console.error("--- Transaction failed! ---", err);
                         if (err instanceof Error && (err.message.includes('UserRejectsError') || err.message.includes('rejected'))) {
                             return 'Transaction rejected in wallet.';
                         }
                         return 'Transaction failed. Please try again.';
                    }
                },
                { success: { duration: 4000 }, error: { duration: 5000 } }
            );
        } catch (error) {
            console.error("--- Error during invoice generation ---", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink)
                .then(() => toast.success("Payment link copied!"))
                .catch(err => {
                    console.error("Failed to copy link:", err);
                    toast.error("Failed to copy link.");
                });
        }
    };

    return (
         <div className="invoice-form">
            <Input label="Amount (TON)" type="number" placeholder="e.g., 10.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Description" type="text" placeholder="e.g., Logo design" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button
                text={isLoading ? "Generating..." : "Generate Link & Record"}
                onClick={handleGenerateLink}
                disabled={isLoading}
            />

            <button onClick={handleBuyTonClick} className="buy-ton-button-secondary">
                Need TON? Buy here 💰
            </button>

            {generatedLink && (
                <div className="generated-link-section">
                    <p>Payment Link:</p>
                    <div className="link-display">
                        <input type="text" readOnly value={generatedLink} className="link-input"/>
                        <button onClick={handleCopyLink} className="copy-button" title="Copy Link">
                            📋
                        </button>
                    </div>
                </div>
            )}
         </div>
    );
}

// Need to define handleBuyTonClick
function handleBuyTonClick() {
    window.open(
      'https://ton.org/en/buy-toncoin?filters[exchange_groups][slug][$eq]=buy-with-card&pagination[page]=1&pagination[pageSize]=100',
      '_blank',
      'noopener,noreferrer'
    );
}