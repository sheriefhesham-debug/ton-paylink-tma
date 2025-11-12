import './disclaimer.css';

export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p>
          TON PayLink Prototype. Browser could block downloads.
        <br />
          All transactions are simulations and do not involve real monetary value.
        <br /> 
          Generated TON Invoice links have a black highlight for safety. For demonstration purposes.
      </p>
      
    </footer>
  );
}