import { useState } from "react";
import MainLayout from "@/shared/components/main-layout";
import s from "./styles.module.scss";
import RobotList from "@/components/page/robot/robot-list";
import RobotDetail from "@/components/page/robot/robot-detail";
import Button from "@/shared/components/butoon";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeviceDto } from "@/api/bot/dto/device";

export default function HasRobot() {
  const navigate = useNavigate();
  const [selectedRobot, setSelectedRobot] = useState<DeviceDto | null>(null);

  const handleAddRobot = () => {
    navigate("/robot/register/section1");
  };

  const handleRobotClick = (device: DeviceDto) => {
    setSelectedRobot(device);
  };

  const handleCloseDetail = () => {
    setSelectedRobot(null);
  };

  return (
    <MainLayout>
      <div className={s.container}>
        <div className={s.header}>
          <div className={s.content}>
            <h1 className={s.title}>로봇 리스트</h1>
            <p className={s.description}>
              로봇을 눌러서 상세 정보를 볼 수 있습니다
            </p>
          </div>
          <Button
            text="로봇 추가하기"
            leftIcon={Plus}
            onClick={handleAddRobot}
          />
        </div>

        <RobotList onRobotClick={handleRobotClick} />

        {selectedRobot && (
          <div className={s.detailOverlay} onClick={handleCloseDetail}>
            <div className={s.detailModal} onClick={(e) => e.stopPropagation()}>
              <RobotDetail
                deviceId={selectedRobot.deviceId}
                onClose={handleCloseDetail}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
