import classNames from "classnames";

import s from "./styles.module.scss";

interface Props {
  text: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function QualityLimitItem({
  text,
  isSelected = false,
  onClick,
}: Props) {
  return (
    <div
      className={classNames(s.container, { [s.selected]: isSelected })}
      onClick={onClick}
    >
      <p className={s.text}>{text}</p>
    </div>
  );
}
