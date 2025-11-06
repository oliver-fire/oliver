import { DeviceDto } from "@/api";
import FireRobotItem from "../fire-robot";
import s from "./styles.module.scss";
import { MapPin, Battery, Badge, Bot } from "lucide-react";
import { Calendar } from "lucide-react";

interface Props {
  type: "robot" | "sensor" | "all";
  onRobotSelect?: (robotId: string | null) => void;
  selectedRobotId?: string | null;
  searchQuery?: string;
  robots?: DeviceDto[];
  sensors?: DeviceDto[];
}

const mapDeviceToRobotItem = (device: DeviceDto) => {
  const locationStr = device.location 
    ? `${device.location.buildingName} ${device.location.floorName}`
    : "정보 없음";
  
  const lastUpdate = device.createdAt 
    ? new Date(device.createdAt).toLocaleDateString("ko-KR")
    : "정보 없음";
  
  const statusMap: Record<string, string> = {
    "idle": "대기중",
    "moving": "이동중",
    "charging": "충전중",
    "error": "고장",
    "paused": "대기중",
    "evolving": "진화중",
    "offline": "오프라인",
    "normal": "정상",
    "warning": "점검필요",
    "alarm": "경고",
  };
  
  const status = statusMap[device.status] || device.status;
  
  return {
    id: device.deviceId,
    name: device.name,
    model: device.type === "robot" ? "소화 로봇" : "화재 감지기",
    status: status,
    battery: device.batteryLevel,
    location: locationStr,
    lastUpdate: lastUpdate,
  };
};

export default function RobotList({ 
  type, 
  onRobotSelect, 
  selectedRobotId, 
  searchQuery = "",
  robots = [],
  sensors = []
}: Props) {
  const items = type === "robot" 
    ? robots 
    : type === "sensor" 
    ? sensors 
    : [...robots, ...sensors];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className={s.robotList}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Bot/>
          <span>로봇</span>
        </div>
        
        <div className={s.headerItem}>
          <Badge/>
          <span>상태</span>
        </div>
        <div className={s.headerItem}>
          <Battery/>
          <span>배터리</span>
        </div>
        <div className={s.headerItem}>
          <MapPin/>
          <span>{type === "robot" ? "로봇 위치" : type === "sensor" ? "센서 위치" : "위치"}</span>
        </div>
        <div className={s.headerItem}>
          <Calendar/>
          <span>등록 일자</span>
        </div>
      </div>

      <div className={s.list}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8B8B8B" }}>
            등록된 {type === "robot" ? "로봇" : type === "sensor" ? "센서" : "디바이스"}이 없습니다.
          </div>
        ) : (
          filteredItems.map((item) => {
            const mappedItem = mapDeviceToRobotItem(item);
            return (
              <FireRobotItem 
                key={item.deviceId} 
                robot={mappedItem} 
                onSelect={onRobotSelect}
                isSelected={selectedRobotId === item.deviceId}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

