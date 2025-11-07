import s from "./styles.module.scss";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: "text" | "email" | "password" | "number";
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  type = "text",
}: InputProps) {
  return (
    <div className={s.inputWrapper}>
      {label && (
        <label className={s.label}>
          {label}
          {required && <span className={s.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        className={s.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
