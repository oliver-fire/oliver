import { useEffect, useState } from "react";
import {
  FireExtinguisher,
  Activity,
  AlertCircle,
  CheckCircle,
  Flame,
} from "lucide-react";
import LogItem from "./log-item";
import s from "./styles.module.scss";
import { getDeviceLogs } from "@/api/bot/service";
import { getDeviceById } from "@/api/bot/service";

interface LogData {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  robotName: string;
  iconType?: string;
}

// 아이콘 타입에 따라 적절한 아이콘과 색상을 반환하는 헬퍼 함수
const getIcon = (iconType: string): React.ReactNode => {
  const isFlame = iconType === "Flame";
  const color = isFlame ? "#F03839" : "#8B8B8B";

  switch (iconType) {
    case "Flame":
      return <Flame size={40} color={color} />;
    case "FireExtinguisher":
      return <FireExtinguisher size={40} color={color} />;
    case "Activity":
      return <Activity size={40} color={color} />;
    case "AlertCircle":
      return <AlertCircle size={40} color={color} />;
    case "CheckCircle":
      return <CheckCircle size={40} color={color} />;
    default:
      return <AlertCircle size={40} color={color} />;
  }
};

interface DeviceLogProps {
  hideTitle?: boolean;
  deviceId?: string;
}

export default function DeviceLog({
  hideTitle = false,
  deviceId,
}: DeviceLogProps) {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        // deviceId가 있으면 API 호출, 없으면 빈 배열
        if (deviceId) {
          const logsResponse = await getDeviceLogs(deviceId);
          const deviceData = await getDeviceById(deviceId);
          const deviceName = deviceData.name || "알 수 없음";

          // 시간 포맷팅 (HH:MM 형식)
          const formatTime = (dateString: string): string => {
            try {
              const date = new Date(dateString);
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              return `${hours}:${minutes}`;
            } catch (error) {
              return "알 수 없음";
            }
          };

          const logsData: LogData[] = logsResponse.data.map((log) => ({
            icon: getIcon(log.icon || "AlertCircle"),
            title: log.title,
            description: log.message,
            time: formatTime(log.timestamp),
            robotName: deviceName,
            iconType: log.icon,
          }));

          setLogs(logsData);
        } else {
          // deviceId가 없으면 빈 배열
          setLogs([]);
        }
      } catch (error) {
        console.error("로그 데이터 가져오기 실패:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [deviceId]);

  if (loading) {
    return (
      <div className={s.container}>
        <div className={s.loading}>로딩 중...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className={s.container}>
        <div className={s.empty}>로그 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      {!hideTitle && <p className={s.main_title}>로봇 동작 기록</p>}
      {logs.map((log, index) => (
        <LogItem
          key={index}
          icon={log.icon}
          title={log.title}
          description={log.description}
          time={log.time}
          robotName={log.robotName}
        />
      ))}
    </div>
  );
}
