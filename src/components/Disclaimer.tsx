import './disclaimer.css';

export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p>
          TON PayLink Prototype created for the TON x Ignyte Global Challenge.
        <br />
          All transactions are simulations and do not involve real monetary value.
        <br /> 
          Smart contracts are unaudited. For demonstration purposes only.
      </p>
    </footer>
  );
}