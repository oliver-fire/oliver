import { ArrowRight, Layers2 } from "lucide-react";

import Button from "../butoon";

import s from "./styles.module.scss";

interface Props {
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
  onClose?: () => void;
}

export default function Alert({
  title,
  message,
  buttonText = "페이지로 이동",
  onButtonClick,
}: Props) {
  return (
    <div className={s.alert}>
      <div className={s.content}>
        <div className={s.iconWrapper}>
          <Layers2 size={28} color="#000000" />
        </div>
        <div className={s.textContent}>
          <h3 className={s.title}>{title}</h3>
          <p className={s.message}>{message}</p>
        </div>
      </div>
      <div className={s.actions}>
        <Button
          text={buttonText}
          onClick={onButtonClick}
          rightIcon={ArrowRight}
          variant="primary"
        />
      </div>
    </div>
  );
}
