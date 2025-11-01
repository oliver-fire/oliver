import { LucideIcon } from "lucide-react";
import s from "./styles.module.scss";

interface Props {
  text: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  width?: string | number;
  height?: string | number;
}

export default function Button({ 
  text, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon, 
  onClick,
  variant = "primary",
  width,
  height
}: Props) {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <button 
      className={`${s.button} ${s[variant]}`}
      onClick={onClick}
      style={style}
    >
      {LeftIcon && <LeftIcon className={s.icon} />}
      <span className={s.text}>{text}</span>
      {RightIcon && <RightIcon className={s.icon} />}
    </button>
  );
}

