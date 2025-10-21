import './dashboard.css';
// We will create InvoiceCard soon
// import { InvoiceCard } from './InvoiceCard'; 

// Sample data (we'll replace this later)
const sampleInvoices = [
  { id: '1', amount: 150, description: 'Logo Design Q4', status: 'Paid', txHash: 'abc...' },
  { id: '2', amount: 50, description: 'Consulting Call', status: 'Pending', txHash: 'def...' },
  { id: '3', amount: 300, description: 'Website Update', status: 'Paid', txHash: 'ghi...' },
];

export function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">My Invoices</h2>
      <div className="invoice-list">
        {sampleInvoices.length === 0 ? (
          <p className="empty-message">No invoices recorded yet.</p>
        ) : (
          sampleInvoices.map((invoice) => (
            // We'll replace this div with the InvoiceCard component later
            <div key={invoice.id} className="invoice-card-placeholder"> 
              <p>{invoice.description}</p>
              <p>Amount: ${invoice.amount}</p>
              <p>Status: {invoice.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}