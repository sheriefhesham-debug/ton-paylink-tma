import './button.css';

// Define the settings (props) our button will accept
interface ButtonProps {
  text: string;
  onClick: () => void;
}

export function Button({ text, onClick }: ButtonProps) {
  return (
    <button className="main-button" onClick={onClick}>
      {text}
    </button>
  );
}