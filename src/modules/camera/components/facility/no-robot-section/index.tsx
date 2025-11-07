import { Plus } from "lucide-react";

import Button from "@/shared/components/butoon";

import s from "./styles.module.scss";

interface Props {
  onAddClick?: () => void;
}

export default function NoRobotSection({ onAddClick }: Props) {
  return (
    <div className={s.noRobotSection}>
      <div className={s.content}>
        <h1 className={s.title}>아직 로봇이 없습니다</h1>
        <p className={s.description}>
          아래 버튼을 눌러 Oliver 로봇을 등록해주세요
        </p>
        <Button
          text="로봇 추가하기"
          leftIcon={Plus}
          onClick={() => onAddClick?.()}
        />
      </div>
    </div>
  );
}
