import { useState } from "react";
import { ChevronDown, Radar } from "lucide-react";
import Button from "@/shared/components/butoon";
import { fireRobots } from "@/mok";
import s from "./styles.module.scss";

interface Props {
  onStartScan: () => void;
}

export default function MakeBuildSection2({ onStartScan }: Props) {
  const [selectedRobotId] = useState<string | null>("robot-001");
  const [isScanning, setIsScanning] = useState(false);
  
  const selectedRobot = fireRobots.find(robot => robot.id === selectedRobotId) || fireRobots[0];

  const handleStartScan = () => {
    setIsScanning(true);
    onStartScan();
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h1 className={s.title}>
          {isScanning ? "LiDAR 센서로 주변 공간 구조를 스캔중입니다" : "주변 공간 정보가 수집되지 않았습니다"}
        </h1>
        <div className={s.instructionGroup}>
          {isScanning ? (
            <p className={s.instruction}>
              스캔 중엔 다른 작업을 하실 수 없습니다.
            </p>
          ) : (
            <>
              <p className={s.instruction}>
                스캔을 시작하면 로봇이 Oliver LiDAR 센서를 이용해 주변 공간 구조를 인식하고 지도를 생성합니다.
              </p>
              <p className={s.instruction}>
                <span>스캔 중에는 </span>
                <span className={s.instructionWarning}>물체를 이동시키거나 사람이 이동하지 않도록 주의해주세요.</span>
              </p>
              <p className={s.instruction}>
                아래에서 건물 스캔에 사용할 로봇을 선택하세요.
              </p>
            </>
          )}
        </div>
        {isScanning && (
          <div className={s.estimatedTime}>
            <span className={s.estimatedTimeLabel}>예상 소요 시간:</span> <span className={s.estimatedTimeHighlight}>2시간 이상</span>
          </div>
        )}
      </div>

      <div className={s.robotSelector}>
        <div className={s.robotIcon}>
          <img src="/sample/fire-robot.svg" alt="로봇" />
        </div>
        <div className={s.robotInfo}>
          <h3 className={s.robotName}>{selectedRobot.name}</h3>
          <p className={s.robotDetails}>{selectedRobot.model}·배터리 {selectedRobot.battery}%</p>
        </div>
        {!isScanning && (
          <div className={s.dropdownIcon}>
            <ChevronDown size={20} />
          </div>
        )}
      </div>

      {!isScanning && (
        <div className={s.estimatedTime}>
          <span className={s.estimatedTimeLabel}>예상 시간:</span> 소형 공간 <span className={s.estimatedTimeHighlight}>20분</span>, 대형 공간 <span className={s.estimatedTimeHighlight}>2시간 이상</span>
        </div>
      )}

      {!isScanning && (
        <div className={s.footer}>
          <Button
            text="스캔 시작하기"
            leftIcon={Radar}
            onClick={handleStartScan}
            width={161}
            height={48}
          />
        </div>
      )}
    </div>
  );
}

