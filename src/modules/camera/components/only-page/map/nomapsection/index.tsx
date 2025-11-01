import { useState } from "react";
import Button from "@/shared/components/butoon";
import { Plus } from "lucide-react";
import MakeBuild from "../widgets/make-buiild";
import s from "./styles.module.scss";

export default function NoMapSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={s.noMapSection}>
        <div className={s.content}>
          <h1 className={s.title}>건물이 추가되지 않았습니다</h1>
          <p className={s.description}>
            현재 관리 중인 건물이 없습니다.
            <br />
            건물을 추가하면 로봇의 작동 상태와 경로를 모니터링할 수 있습니다.
          </p>
          <Button 
            text="건물 추가하기" 
            leftIcon={Plus} 
            onClick={() => setIsModalOpen(true)} 
            width={161} 
            height={48} 
          />
        </div>
      </div>
      
      <MakeBuild 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}