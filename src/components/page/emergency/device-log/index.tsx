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

export default function DeviceLog() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // TODO: API 호출로 교체
        // 임시 mock 데이터
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

        const mockLogsData = [
          {
            iconType: "FireExtinguisher",
            title: "화재 진압 시작",
            description: "소화액 분사 시작",
            time: "14:32",
            robotName: "소화 로봇 1호",
          },
          {
            iconType: "Activity",
            title: "화재 감지",
            description: "온도 상승 감지",
            time: "14:30",
            robotName: "화재 감지기 1호",
          },
          {
            iconType: "AlertCircle",
            title: "비상 상황 발생",
            description: "화재 알림 전송",
            time: "14:29",
            robotName: "화재 감지기 2호",
          },
          {
            iconType: "CheckCircle",
            title: "화재 진압 완료",
            description: "소화 작업 완료",
            time: "14:25",
            robotName: "소화 로봇 2호",
          },
          {
            iconType: "Flame",
            title: "화재 진압 진행 중",
            description: "소화액 분사 중",
            time: "14:20",
            robotName: "소화 로봇 3호",
          },
        ];

        const mockLogs: LogData[] = mockLogsData.map((log) => ({
          ...log,
          icon: getIcon(log.iconType),
        }));

        setLogs(mockLogs);
      } catch (error) {
        console.error("로그 데이터 가져오기 실패:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
      <p className={s.main_title}>로봇 동작 기록</p>
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
