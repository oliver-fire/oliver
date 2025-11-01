import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import Button from "@/shared/components/butoon";
import s from "./stlyes.module.scss";

interface Props {
  onNext?: (type: "robot" | "sensor") => void;
}

export default function Section1({ onNext }: Props) {
  const [selectedType, setSelectedType] = useState<"robot" | "sensor">("robot");

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h1 className={s.title}>로봇 등록하기</h1>
        <p className={s.description}>아래 버튼을 눌러 올리버 로봇을 등록해주세요</p>
      </div>

      <div className={s.cards}>
        <div 
          className={`${s.card} ${selectedType === "robot" ? s.selected : ""}`}
          onClick={() => setSelectedType("robot")}
        >
          <h2 className={s.cardTitle}>소화 로봇</h2>
          <p className={s.cardDescription}>화재가 발생하였을 때 초기 진압을 하는 로봇입니다</p>
          <div className={s.cardImage}>
            <img src="/sample/fire-robot.svg" alt="소화 로봇" />
          </div>
          <div className={s.checkIndicator}>
            {selectedType === "robot" ? (
              <div className={s.checkBoxChecked}>
                <Check size={16} color="white" />
              </div>
            ) : (
              <div className={s.checkBox} />
            )}
          </div>
        </div>

        <div 
          className={`${s.card} ${selectedType === "sensor" ? s.selected : ""}`}
          onClick={() => setSelectedType("sensor")}
        >
          <h2 className={s.cardTitle}>화재 감지기</h2>
          <p className={s.cardDescription}>올리버 시스템과 연동되어 화재를 감지합니다</p>
          <div className={s.cardImage}>
            <img src="/sample/fire-robot.svg" alt="화재 감지기" />
          </div>
          <div className={s.checkIndicator}>
            {selectedType === "sensor" ? (
              <div className={s.checkBoxChecked}>
                <Check size={16} color="white" />
              </div>
            ) : (
              <div className={s.checkBox} />
            )}
          </div>
        </div>
      </div>

      <div className={s.footer}>
        <Button
          text="다음"
          rightIcon={ChevronRight}
          onClick={() => onNext?.(selectedType)}
          width={98}
          height={48}
        />
      </div>
    </div>
  );
}

