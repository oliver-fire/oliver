import s from "./styles.module.scss";
import { Loader, BatteryCharging, BellElectric, FireExtinguisher, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  robot: any;
  onSelect?: (robotId: string | null) => void;
  isSelected?: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "대기중":
      return {
        icon: Loader,
        bgColor: "#F5F5F5",
        textColor: "#8B8B8B",
      };
    case "충전중":
      return {
        icon: BatteryCharging,
        bgColor: "#E0F7E3",
        textColor: "#48B842",
      };
    case "이동중":
      return {
        icon: BellElectric,
        bgColor: "#FFF3E0",
        textColor: "#FF8C00",
      };
      case "진화중":
        return {
          icon: FireExtinguisher,
          bgColor: "#FFE5E5",
          textColor: "#FF4842",
        };
      case "정상":
      return {
        icon: CheckCircle,
        bgColor: "#E0F7E3",
        textColor: "#48B842",
      };
    case "점검필요":
      return {
        icon: AlertTriangle,
        bgColor: "#FFF3E0",
        textColor: "#FF8C00",
      };
    case "고장":
      return {
        icon: XCircle,
        bgColor: "#FFE5E5",
        textColor: "#FF4842",
      };
    default:
      return {
        icon: Loader,
        bgColor: "#F5F5F5",
        textColor: "#8B8B8B",
      };
  }
};

const getBatteryConfig = (battery: number) => {
  if (battery >= 60) {
    return {
      color: "#48B842",
      bgColor: "#E0F7E3"
    };
  }
  if (battery >= 30) {
    return {
      color: "#FF8C00",
      bgColor: "#FFF3E0"
    };
  }
  return {
    color: "#FF4842",
    bgColor: "#FFE5E5"
  };
};

export default function FireRobotItem({ robot, onSelect, isSelected = false }: Props) {
  const statusConfig = getStatusConfig(robot.status);
  const StatusIcon = statusConfig.icon;
  const batteryConfig = getBatteryConfig(robot.battery);

  const handleClick = () => {
    if (onSelect) {
      onSelect(isSelected ? null : robot.id);
    }
  };

  return (
    <div 
      className={`${s.robotItem} ${isSelected ? s.selected : ''}`}
      onClick={handleClick}
    >
      <div className={s.left}>
        <img src="/sample/fire-robot.svg" alt="소방 로봇" className={s.robotImage} />
        <div className={s.info}>
          <h3 className={s.name}>{robot.name}</h3>
          <p className={s.model}>{robot.model}</p>
        </div>
      </div>

      <div className={s.statusWrapper}>
        <div 
          className={s.statusBox}
          style={{ 
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.textColor
          }}
        >
          <StatusIcon size={16} />
          <span>{robot.status || "정보 없음"}</span>
        </div>
      </div>

      <div className={s.battery}>
        <div 
          className={s.batteryBar}
          style={{ backgroundColor: batteryConfig.bgColor }}
        >
          <div 
            className={s.batteryFill} 
            style={{ 
              width: `${robot.battery}%`,
              backgroundColor: batteryConfig.color 
            }}
          />
        </div>
        
        <span className={s.batteryText} style={{ color: batteryConfig.color }}>
          {robot.battery}%
        </span>
      </div>

      <div className={s.location}>{robot.location || "정보 없음"}</div>

      <div className={s.lastUpdate}>{robot.lastUpdate || "정보 없음"}</div>
    </div>
  );
}

