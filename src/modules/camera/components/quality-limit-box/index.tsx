import { useState } from "react";
import QualityLimitItem from "./quality-limit-item";
import s from "./styles.module.scss";

const qualityOptions = ["HD 30fps", "HD 60fps", "4K 60fps", "8K 120fps"];

export default function QualityLimitBox() {
  const [selectedQuality, setSelectedQuality] = useState<string>("HD 30fps");

  return (
    <div className={s.container}>
      {qualityOptions.map((option) => (
        <QualityLimitItem
          key={option}
          text={option}
          isSelected={selectedQuality === option}
          onClick={() => setSelectedQuality(option)}
        />
      ))}
    </div>
  );
}