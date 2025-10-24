import './button.css'; // Ensure CSS import uses correct lowercase filename

// Define the settings (props) our button will accept
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean; // <-- Add optional disabled prop
}

export function Button({ text, onClick, disabled }: ButtonProps) {
  return (
    <button 
      className="main-button" 
      onClick={onClick}
      disabled={disabled} // <-- Pass disabled prop to HTML button
    >
      {text}
    </button>
  );
}