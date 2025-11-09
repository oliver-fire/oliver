import { useEffect, useState } from "react";
import { getDevicesByType } from "@/api/bot/service";
import { DeviceDto, DeviceType } from "@/api/bot/dto/device";
import CameraItem from "./camera-item";
import s from "./styles.module.scss";

export default function CameraViewer() {
  const [robots, setRobots] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        setLoading(true);
        const robotDevices = await getDevicesByType(DeviceType.ROBOT);
        setRobots(robotDevices);
      } catch (error) {
        console.error("로봇 데이터 가져오기 실패:", error);
        setRobots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRobots();
  }, []);

  const handleCameraClick = (robot: DeviceDto) => {
    // TODO: 카메라 상세 보기 또는 모달 열기
    console.log("카메라 클릭:", robot);
  };

  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.loading}>로딩 중...</div>
      </div>
    );
  }

  if (robots.length === 0) {
    return (
      <div className={s.container}>
        <div className={s.empty}>등록된 로봇이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      {robots.map((robot) => (
        <CameraItem
          key={robot.deviceId}
          robotName={robot.name}
          videoUrl="/sample/neo.mp4"
          onClick={() => handleCameraClick(robot)}
        />
      ))}
    </div>
  );
}
