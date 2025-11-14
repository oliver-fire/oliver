import { X } from "lucide-react";

import Button from "@/shared/components/butoon";
import Input from "@/shared/components/input";

import s from "./styles.module.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getBuildingFloors, createBuildingFloor } from "@/api/building/service";

export default function MapRegisterSection1() {
  const navigate = useNavigate();
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    navigate("/map");
  };

  const handleNext = async () => {
    if (!buildingName || !address) return;

    try {
      setIsCreating(true);

      // 층 목록 조회 (/v1/building/{id}/floors)
      const floorsResponse = await getBuildingFloors();
      const existingFloors = floorsResponse.data;

      // 층이 있으면 다음 레벨, 없으면 1층
      let nextLevel = 1;
      if (existingFloors.length > 0) {
        // 가장 높은 레벨 찾기
        const maxLevel = Math.max(
          ...existingFloors.map((floor) => floor.level)
        );
        nextLevel = maxLevel + 1;
      }

      // 층 생성 (/v1/building/{id}/floor) - 층 이름은 건물 이름으로 사용
      await createBuildingFloor({
        level: nextLevel,
        name: buildingName,
        address: address,
      });

      navigate("/map/register/section2");
    } catch (error) {
      console.error("층 생성 실패:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={s.container} onClick={handleClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h2 className={s.title}>건물 추가하기</h2>
          <button className={s.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        <div className={s.content}>
          <div className={s.inputContent}>
            <Input
              label="공간 이름"
              placeholder="공간 이름을 입력하세요"
              required
              value={buildingName}
              onChange={setBuildingName}
            />
            <Input
              label="상세 도로명 주소"
              placeholder="긴급 상황에 119에 사용되는 정보입니다."
              required
              value={address}
              onChange={setAddress}
            />
          </div>
        </div>
        <div className={s.footer}>
          <Button
            text="눌러서 추가하기"
            onClick={handleNext}
            disabled={!buildingName || !address || isCreating}
          />
        </div>
      </div>
    </div>
  );
}
