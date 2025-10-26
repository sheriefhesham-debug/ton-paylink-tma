import './invoiceForm.css';
import { Input } from './Input';
import { Button } from './Button';
// Import useEffect and useState
import { useState, useEffect } from 'react'; 
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import toast from 'react-hot-toast';

// Define and EXPORT the Invoice interface
export interface Invoice {
    id: string;
    amount: number; // USD amount
    description: string;
    status: 'Pending' | 'Paid';
    txHash?: string;
    timestamp: number;
    tonAmount?: number; // Converted TON amount
}

export function InvoiceForm() {
    const [amountUsd, setAmountUsd] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    
    // --- New State for Price ---
    const [tonPrice, setTonPrice] = useState<string | null>(null); // State to hold the fetched price
    
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    // --- New Effect to Fetch Price ---
    useEffect(() => {
        console.log("Fetching TON price...");
        // Fetch the price when the component mounts
        fetch('/api/getPrice') // Calls our Vercel serverless function
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch price');
                }
                return response.json();
            })
            .then(data => {
                if (data.price) {
                    // Format the price to 2 decimal places
                    const priceString = `1 TON = $${Number(data.price).toFixed(2)} USD`;
                    setTonPrice(priceString); // Set the price string to state
                    console.log("Price fetched:", priceString);
                } else {
                    throw new Error('Invalid price data');
                }
            })
            .catch(error => {
                console.error("Failed to fetch TON price:", error);
                setTonPrice("Live price unavailable"); // Show error in UI
            });
    }, []); // Empty dependency array means this runs only once

    const handleGenerateLink = async () => {
        // ... (This function remains exactly the same as before) ...

        if (!wallet) { toast.error("Please connect your wallet first."); return; }
        const amountInUsd = parseFloat(amountUsd);
        if (isNaN(amountInUsd) || amountInUsd <= 0 || !description.trim()) {
            toast.error("Please enter a valid amount (in USD) and description.");
            return;
        }
        setIsLoading(true); setGeneratedLink(null);
        let userFriendlyAddress = '';
        let newInvoiceId = `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const priceToastId = toast.loading("Fetching live TON price...");
        try {
            const response = await fetch('/api/getPrice'); 
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.details || 'Network error fetching price'); }
            const data = await response.json();
            if (!data.price) { throw new Error('Price data not found in API response'); }
            const tonPrice = data.price as number;
            const amountInTon = amountInUsd / tonPrice;
            toast.dismiss(priceToastId);

            const rawAddressString = wallet.account.address;
            const addressObject = Address.parse(rawAddressString);
            userFriendlyAddress = addressObject.toString({ testOnly: true });

            const invoiceData = { type: "TONPayLinkInvoice_v1", amount_usd: amountInUsd, amount_ton: parseFloat(amountInTon.toFixed(9)), desc: description.trim(), status: "pending" };
            const memoText = JSON.stringify(invoiceData);
            const maxMemoTextLength = 100;
            if (memoText.length > maxMemoTextLength) { toast.error(`Description/Data too long for memo (max ~${maxMemoTextLength} chars).`); setIsLoading(false); return; }

            const commentCell = beginCell().storeUint(0, 32).storeStringTail(memoText).endCell();
            const payloadBase64 = commentCell.toBoc().toString('base64');
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [ { address: userFriendlyAddress, amount: toNano('0.005').toString(), payload: payloadBase64 } ]
            };

            const sendPromise = tonConnectUI.sendTransaction(transaction);

            await toast.promise( sendPromise, {
                loading: 'Recording invoice...',
                success: (result) => {
                    console.log("--- Transaction sent! ---", result.boc);
                    try {
                        const newInvoice: Invoice = {
                             id: newInvoiceId,
                             amount: amountInUsd,
                             tonAmount: parseFloat(amountInTon.toFixed(9)),
                             description: description.trim(),
                             status: 'Pending', timestamp: Date.now()
                         };
                        const storageKey = `invoices_${userFriendlyAddress}`;
                        const existingInvoicesRaw = localStorage.getItem(storageKey);
                        const existingInvoices: Invoice[] = existingInvoicesRaw ? JSON.parse(existingInvoicesRaw) : [];
                        existingInvoices.unshift(newInvoice);
                        localStorage.setItem(storageKey, JSON.stringify(existingInvoices));
                        console.log("--- Invoice saved to Local Storage ---", newInvoice);

                        const amountInNanoTon = toNano(amountInTon.toFixed(9));
                        const paymentLink = `ton://transfer/${userFriendlyAddress}?amount=${amountInNanoTon.toString()}&text=${newInvoice.id}`;
                        setGeneratedLink(paymentLink);
                        console.log("--- Payment Link Generated ---", paymentLink);
                    } catch (storageError) { console.error("--- Failed to save invoice to LS ---", storageError); }
                    setAmountUsd(''); setDescription('');
                    return 'Invoice Recorded & Link Ready!';
                },
                error: (err) => {
                     console.error("--- Transaction failed! ---", err);
                     if (err instanceof Error && (err.message.includes('UserRejectsError') || err.message.includes('rejected'))) {
                         return 'Transaction rejected in wallet.';
                     }
                     return 'Transaction failed. Please try again.';
                }
            });
        } catch (error) {
            console.error("--- Error during invoice generation ---", error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
            if (priceToastId) toast.dismiss(priceToastId);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Copy Link Function ---
    const handleCopyLink = () => { /* ... (Keep as before) ... */ };

    // --- Buy TON Function ---
    const handleBuyTonClick = () => { /* ... (Keep as before) ... */ };

    // --- JSX ---
    return (
         <div className="invoice-form">
            <Input label="Amount (USD)" type="number" placeholder="e.g., 150" value={amountUsd} onChange={(e) => setAmountUsd(e.target.value)} />
            <Input label="Description" type="text" placeholder="e.g., Logo design" value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <Button
                text={isLoading ? "Generating..." : "Generate Link & Record"}
                onClick={handleGenerateLink}
                disabled={isLoading}
            />
            
            <button onClick={handleBuyTonClick} className="buy-ton-button-secondary">
                Need TON? Buy here 💰
            </button>

            {/* --- New Price Display Element --- */}
            {/* We use a <div> styled to look just like the button above it */}
            <div className="price-display-box">
                {tonPrice ? tonPrice : "Loading price..."}
            </div>

            {/* Display Generated Link */}
            {generatedLink && (
                <div className="generated-link-section">
                    <p>Payment Link (for {parseFloat(amountUsd).toFixed(2)} USD):</p>
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

// Need to define handleCopyLink
if (!('handleCopyLink' in window)) {
    (window as any).handleCopyLink = (generatedLink: string | null) => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink)
                .then(() => toast.success("Payment link copied!"))
                .catch(err => {
                    console.error("Failed to copy link:", err);
                    toast.error("Failed to copy link.");
                });
        }
    };
}

// Need to define handleBuyTonClick
if (!('handleBuyTonClick' in window)) {
    (window as any).handleBuyTonClick = () => {
        window.open(
          'https://ton.org/en/buy-toncoin?filters[exchange_groups][slug][$eq]=buy-with-card&pagination[page]=1&pagination[pageSize]=100',
          '_blank',
          'noopener,noreferrer'
        );
    };
}