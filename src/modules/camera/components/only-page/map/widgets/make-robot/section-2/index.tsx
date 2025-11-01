import { useEffect } from "react";
import Button from "@/shared/components/butoon";
import s from "./styles.module.scss";

interface Props {
  onBack?: () => void;
  onNext?: () => void;
}

export default function Section2({ onBack, onNext }: Props) {
  useEffect(() => {
    // 3초 후 자동으로 다음 단계로 이동
    const timer = setTimeout(() => {
      onNext?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onNext]);
  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2 className={s.title}>주변 로봇 찾는 중...</h2>
        <p className={s.description}>
          잠시 뒤 나오는 팝업에서 "OLV-FIR"로 시작하는 요소를 선택 해주세요
        </p>
      </div>

      <div className={s.imageContainer}>
        <img src="/sample/robot-link.svg" alt="로봇 연결" />
      </div>

      <div className={s.footer}>
        <Button
          text="뒤로 가기"
          onClick={() => onBack?.()}
          variant="secondary"
          width={103}
          height={48}
        />
      </div>
    </div>
  );
}

