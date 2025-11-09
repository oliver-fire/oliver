import { useEffect, useState } from "react";
import {
  FireExtinguisher,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import LogItem from "./log-item";
import s from "./styles.module.scss";

interface LogData {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  robotName: string;
}

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

        const mockLogs: LogData[] = [
          {
            icon: <FireExtinguisher size={40} color="#F03839" />,
            title: "화재 진압 시작",
            description: "소화액 분사 시작",
            time: "14:32",
            robotName: "소화 로봇 1호",
          },
          {
            icon: <Activity size={40} color="#FF9201" />,
            title: "화재 감지",
            description: "온도 상승 감지",
            time: "14:30",
            robotName: "화재 감지기 1호",
          },
          {
            icon: <AlertCircle size={40} color="#F03839" />,
            title: "비상 상황 발생",
            description: "화재 알림 전송",
            time: "14:29",
            robotName: "화재 감지기 2호",
          },
          {
            icon: <CheckCircle size={40} color="#48B842" />,
            title: "화재 진압 완료",
            description: "소화 작업 완료",
            time: "14:25",
            robotName: "소화 로봇 2호",
          },
          {
            icon: <FireExtinguisher size={40} color="#FF9201" />,
            title: "화재 진압 진행 중",
            description: "소화액 분사 중",
            time: "14:20",
            robotName: "소화 로봇 3호",
          },
        ];

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
