import { useEffect, useRef } from "react";
import { useEmergencySocket } from "@/hooks/useEmergencySocket";

interface AppProps {
  children: React.ReactNode;
}

export default function App({ children }: AppProps) {
  const { emergencyData, isConnected, error, clearEmergencyData } =
    useEmergencySocket();
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (emergencyData) {
      // 중복 이벤트 체크
      if (processedEventIdsRef.current.has(emergencyData.eventId)) {
        console.log(
          "⚠️ [App] 이미 처리된 이벤트입니다:",
          emergencyData.eventId
        );
        return;
      }

      // 이미 emergency 페이지에 있으면 이동하지 않음
      if (window.location.pathname === "/emergency") {
        console.log("⚠️ [App] 이미 emergency 페이지에 있습니다.");
        processedEventIdsRef.current.add(emergencyData.eventId);
        clearEmergencyData();
        return;
      }

      console.log(
        "🚨 [App] 화재 발생 감지, emergency 페이지로 이동:",
        emergencyData
      );

      // 이벤트 ID 저장
      processedEventIdsRef.current.add(emergencyData.eventId);

      // emergency 페이지로 이동
      window.location.href = "/emergency";

      // 데이터 초기화
      clearEmergencyData();
    }
  }, [emergencyData, clearEmergencyData]);

  // 연결 상태 로깅 (개발용)
  useEffect(() => {
    if (isConnected) {
      console.log("✅ [App] WebSocket 연결됨");
    } else if (error) {
      console.error("❌ [App] WebSocket 연결 오류:", error);
    }
  }, [isConnected, error]);

  return <>{children}</>;
}

