import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface EmergencyData {
  eventId: string;
  incidentId: string;
  sensorId: string;
  buildingName: string;
  floorName: string;
  message: string;
  timestamp: string;
}

const getSocketUrl = (): string => {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  return isLocal ? "http://localhost:5173" : "https://oliver-api.thnos.app";
};

export function useEmergencySocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const serverUrl = getSocketUrl();
    console.log("🔌 [WebSocket] 연결 시도:", serverUrl);

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000, // 20초
      forceNew: false,
      upgrade: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ [WebSocket] 연결됨:", newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ [WebSocket] 연결 끊김:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("⚠️ [WebSocket] 연결 오류:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 [WebSocket] 재연결 성공:", attemptNumber);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 [WebSocket] 재연결 시도:", attemptNumber);
    });

    newSocket.on("emergency:triggered", (data: EmergencyData) => {
      console.log("🚨 [WebSocket] 화재 발생!", data);

      // 중복 이벤트 체크
      if (processedEventIdsRef.current.has(data.eventId)) {
        console.log(
          "⚠️ [WebSocket] 이미 처리된 이벤트입니다:",
          data.eventId
        );
        return;
      }

      // 이벤트 ID 저장
      processedEventIdsRef.current.add(data.eventId);

      // Emergency 데이터 설정
      setEmergencyData(data);
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 [WebSocket] 연결 종료");
      newSocket.close();
    };
  }, []);

  const clearEmergencyData = useCallback(() => {
    setEmergencyData(null);
  }, []);

  return {
    socket,
    emergencyData,
    isConnected,
    error,
    clearEmergencyData,
  };
}

