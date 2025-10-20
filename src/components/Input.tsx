import './input.css';

// We've added two new props: `value` and `onChange`
interface InputProps {
  label: string;
  value: string; // The current value to display in the input
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // A function to call when the user types
  type?: string;
  placeholder?: string;
}

export function Input({ label, value, onChange, type = 'text', placeholder }: InputProps) {
  return (
    <div className="input-wrapper">
      <label className="input-label">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className="input-field" 
        value={value} // We bind the input's value to our new prop
        onChange={onChange} // We tell the input to call our function when it changes
      />
    </div>
  );
}