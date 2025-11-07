import { ChevronRight } from "lucide-react";
import { useState } from "react";

import Button from "@/shared/components/butoon";

import s from "./styles.module.scss";

interface Props {
  robotType: "robot" | "sensor";
  serialNumber?: string;
  onConfirm?: () => void;
  onExit?: () => void;
  onSearchAgain?: () => void;
}

export default function Section3({
  robotType,
  serialNumber = "OLV960XFH-X92AG",
  onConfirm,
  onExit,
  onSearchAgain,
}: Props) {
  const robotTypeText = robotType === "robot" ? "소화 로봇" : "화재 감지기";
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm?.();

    // 3초 후 나가기 버튼 표시
    setTimeout(() => {
      setShowExitButton(true);
    }, 3000);
  };

  const getTitle = () => {
    if (showExitButton) return "로봇 등록됨";
    if (isConfirmed) return "로봇 등록중";
    return "로봇을 찾음";
  };

  const getDescription = () => {
    if (showExitButton) return "";
    if (isConfirmed) return "";
    return "아래 표시되는 로봇이 맞나요?";
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h1 className={s.title}>{getTitle()}</h1>
        {getDescription() && (
          <p className={s.description}>{getDescription()}</p>
        )}
      </div>

      <div className={s.robotCard}>
        <div className={s.robotIcon}>
          <img src="/sample/fire-robot.svg" alt={robotTypeText} />
        </div>
        <div className={s.robotInfo}>
          <h2 className={s.robotType}>{robotTypeText}</h2>
          <div className={s.serialNumber}>
            <span className={s.serialLabel}>S/N</span>
            <span className={s.serialValue}>{serialNumber}</span>
          </div>
        </div>
      </div>

      <div className={s.buttons}>
        {!isConfirmed ? (
          <>
            <Button
              text="다른 로봇 찾기"
              onClick={() => onSearchAgain?.()}
              variant="secondary"
            />
            <Button
              text="네, 맞아요"
              rightIcon={ChevronRight}
              onClick={handleConfirm}
            />
          </>
        ) : showExitButton ? (
          <Button
            text="나가기"
            rightIcon={ChevronRight}
            onClick={() => onExit?.()}
          />
        ) : (
          <div className={s.expectedTime}>예상 시간: 1분</div>
        )}
      </div>
    </div>
  );
}
