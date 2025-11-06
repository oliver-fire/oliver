import { LucideIcon } from "lucide-react";
import s from "./styles.module.scss";

interface Props {
  text: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ 
  text, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon, 
  onClick,
  variant = "primary"
}: Props) {
  return (
    <button 
      className={`${s.button} ${s[variant]}`}
      onClick={onClick}
    >
      {LeftIcon && <LeftIcon className={s.icon} />}
      <span className={s.text}>{text}</span>
      {RightIcon && <RightIcon className={s.icon} />}
    </button>
  );
}

