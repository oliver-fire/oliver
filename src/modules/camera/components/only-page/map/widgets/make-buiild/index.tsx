import { X } from "lucide-react";
import Button from "@/shared/components/butoon";
import Input from "@/shared/components/input";
import s from "./styles.module.scss";

interface MakeBuildProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MakeBuild({ isOpen, onClose }: MakeBuildProps) {
  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h2 className={s.title}>건물 추가</h2>
          <button className={s.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={s.content}>
          <div className={s.inputContent}>
            <Input
              label="건물 이름"
              placeholder="건물 이름을 입력하세요"
              required
            />
            <Input
              label="도로명 주소"
              placeholder="긴급 상황에 사용되는 정보입니다."
              required
            />
          </div>
        </div>
        <div className={s.footer}>
          <Button
            text="눌러서 추가하기"
            onClick={() => {
              // TODO: 건물 추가 로직
              onClose();
            }}
            width={147}
            height={48}
          />
        </div>
      </div>
    </div>
  );
}
