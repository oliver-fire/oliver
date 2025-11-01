import { Check } from "lucide-react";
import { useState } from "react";
import s from "./styles.module.scss";

interface Props {
  label: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({ label, defaultChecked = false, onChange }: Props) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <label className={s.container}>
      <div 
        className={`${s.checkbox} ${checked ? s.checked : ""}`}
        onClick={handleToggle}
      >
        {checked && <Check className={s.checkIcon} />}
      </div>
      <span className={s.label}>{label}</span>
    </label>
  );
}

