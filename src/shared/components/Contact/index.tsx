import { LucideIcon } from "lucide-react";
import { useState } from "react";

import Segment from "../segment";

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
  placeholder,
}: Props) {
  const [selected, setSelected] = useState<"first" | "second">("first");

  return (
    <div className={s.container}>
      <h5 className={s.title}>{title}</h5>

      <Segment
        items={[
          { label: firstButtonText, value: "first" },
          { label: secondButtonText, value: "second" },
        ]}
        selected={selected}
        onChange={(value) => setSelected(value as "first" | "second")}
      />

      <div className={s.phoneInput}>
        <Icon className={s.icon} />
        <input type="text" placeholder={placeholder} className={s.input} />
      </div>
    </div>
  );
}
