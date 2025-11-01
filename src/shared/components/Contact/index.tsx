import { LucideIcon } from "lucide-react";
import { useState } from "react";
import s from "./styles.module.scss";

interface Props {
  title: string;
  firstButtonText: string;
  secondButtonText: string;
  icon: LucideIcon;
  placeholder: string;
}

export default function Contact({ 
  title, 
  firstButtonText, 
  secondButtonText, 
  icon: Icon, 
  placeholder 
}: Props) {
  const [selected, setSelected] = useState<"first" | "second">("first");

  return (
    <div className={s.container}>
      <h5 className={s.title}>{title}</h5>
      
      <div className={s.buttonGroup}>
        <button 
          className={`${s.button} ${selected === "first" ? s.active : ""}`}
          onClick={() => setSelected("first")}
        >
          {firstButtonText}
        </button>
        <button 
          className={`${s.button} ${selected === "second" ? s.active : ""}`}
          onClick={() => setSelected("second")}
        >
          {secondButtonText}
        </button>
      </div>

      <div className={s.phoneInput}>
        <Icon className={s.icon} />
        <input 
          type="text" 
          placeholder={placeholder} 
          className={s.input}
        />
      </div>
    </div>
  );
}

