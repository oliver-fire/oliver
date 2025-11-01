import { fireRobots, fireSensors } from "@/mok";
import FireRobotItem from "../fire-robot";
import s from "./styles.module.scss";
import { MapPin, Battery, Badge, Minus } from "lucide-react";
import { Calendar } from "lucide-react";

interface Props {
  type: "robot" | "sensor" | "all";
  onRobotSelect?: (robotId: string | null) => void;
  selectedRobotId?: string | null;
  searchQuery?: string;
}

export default function RobotList({ type, onRobotSelect, selectedRobotId, searchQuery = "" }: Props) {
  const items = type === "robot" 
    ? fireRobots 
    : type === "sensor" 
    ? fireSensors 
    : [...fireRobots, ...fireSensors];

  // 검색 필터링
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className={s.robotList}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div style={{ backgroundColor: "#1F2024", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" , borderRadius: 8 }}>
            <Minus size={16} color="white" />
          </div>
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
        {filteredItems.map((item) => (
          <FireRobotItem 
            key={item.id} 
            robot={item} 
            onSelect={onRobotSelect}
            isSelected={selectedRobotId === item.id}
          />
        ))}
      </div>
    </div>
  );
}

