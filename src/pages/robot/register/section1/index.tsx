import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/components/butoon";
import MainLayout from "@/shared/components/main-layout";
import { ArrowRight } from "lucide-react";

import s from "./styles.module.scss";
import RobotRegisterCard from "@/components/page/robot/robot-register-card";
import { getBuildingFloors } from "@/api/building/service";

type Step = "selectType" | "selectFloor";
type DeviceType = "robot" | "sensor";

interface Floor {
  id: string;
  level: number;
  name: string;
}

// 1. 타입 선택 화면
const SelectType = ({
  selectedType,
  onSelect,
  onNext,
}: {
  selectedType: DeviceType | null;
  onSelect: (type: DeviceType) => void;
  onNext: () => void;
}) => {
  const isNextDisabled = selectedType === null;

  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>로봇 등록하기</h1>
        <p className={s.description}>
          아래 버튼을 눌러 Oliver 로봇을 등록해주세요
        </p>
      </div>

      <div className={s.choice}>
        <RobotRegisterCard
          title="소화 로봇"
          description="화재가 발생하였을 때 초기 진압을 하는 로봇입니다"
          image="/sample/oliver.png"
          selected={selectedType === "robot"}
          onSelect={() => onSelect("robot")}
        />

        <RobotRegisterCard
          title="화재 감지기"
          description="올리버 시스템과 연동되어 화재를 감지합니다"
          image="/sample/sensor.jpg"
          selected={selectedType === "sensor"}
          onSelect={() => onSelect("sensor")}
        />
      </div>

      <Button
        text="다음"
        rightIcon={ArrowRight}
        onClick={onNext}
        disabled={isNextDisabled}
      />
    </div>
  );
};

// 2. 층 선택 화면
const SelectFloor = ({
  selectedFloorId,
  onSelect,
  onNext,
  floors,
  loading,
}: {
  selectedFloorId: string | null;
  onSelect: (floorId: string) => void;
  onNext: () => void;
  floors: Floor[];
  loading: boolean;
}) => {
  const isNextDisabled = selectedFloorId === null;

  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>층 선택</h1>
        <p className={s.description}>등록할 로봇이 위치할 층을 선택해주세요</p>
      </div>

      {loading ? (
        <p className={s.description}>로딩 중...</p>
      ) : (
        <>
          <div className={s.floorList}>
            {floors.length === 0 ? (
              <p className={s.description}>등록된 층이 없습니다.</p>
            ) : (
              floors.map((floor) => (
                <div
                  key={floor.id}
                  className={`${s.floorItem} ${
                    selectedFloorId === floor.id ? s.selected : ""
                  }`}
                  onClick={() => onSelect(floor.id)}
                >
                  <div className={s.floorInfo}>
                    <span className={s.floorName}>{floor.name}</span>
                    <span className={s.floorLevel}>{floor.level}층</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            text="다음"
            rightIcon={ArrowRight}
            onClick={onNext}
            disabled={isNextDisabled}
          />
        </>
      )}
    </div>
  );
};

export default function Register1() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("selectType");
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);

  // 층 목록 가져오기
  const fetchFloors = async () => {
    try {
      setLoading(true);
      const response = await getBuildingFloors();
      setFloors(response.data);
    } catch (error) {
      console.error("층 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "selectFloor") {
      fetchFloors();
    }
  }, [step]);

  const handleTypeSelect = (type: DeviceType) => {
    setSelectedType(type);
  };

  const handleTypeNext = () => {
    if (selectedType) {
      setStep("selectFloor");
    }
  };

  const handleFloorNext = () => {
    if (selectedType && selectedFloorId) {
      navigate(
        `/robot/register/section2?type=${selectedType}&floorId=${selectedFloorId}`
      );
    }
  };

  const renderContent = () => {
    switch (step) {
      case "selectType":
        return (
          <SelectType
            selectedType={selectedType}
            onSelect={handleTypeSelect}
            onNext={handleTypeNext}
          />
        );
      case "selectFloor":
        return (
          <SelectFloor
            selectedFloorId={selectedFloorId}
            onSelect={setSelectedFloorId}
            onNext={handleFloorNext}
            floors={floors}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return <MainLayout>{renderContent()}</MainLayout>;
}
