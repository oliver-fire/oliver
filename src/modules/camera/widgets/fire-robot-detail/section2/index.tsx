import { useState } from "react";
import { FireRobot, FireSensor } from "@/mok";
import Button from "@/shared/components/butoon";
import { Pencil, X, Trash2, Wifi, Timer, Calendar, BatteryLow, BatteryFull, Layers2, FireExtinguisher } from "lucide-react";
import s from "./styles.module.scss";

function RobotInfoCard({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className={s.infoCard}>
      <div className={s.infoCardHeader}>
        {Icon && <Icon size={18} className={s.infoIcon} />}
        <span className={s.label}>{label}</span>
      </div>
      <span className={s.value}>{value}</span>
    </div>
  );
}

function LocationSection() {
  return (
    <div className={s.locationSection}>
      <div className={s.locationIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className={s.locationInfo}>
        <p className={s.locationEmpty}>위치 정보가 없습니다</p>
      </div>
    </div>
  );
}

function KeyRecordSection() {
  return (
    <div className={s.keyRecordSection}>
      <p className={s.sectionTitle}>최근 기록</p>
      <div className={s.recordList}>
        <div className={s.recordItem}>
          <div className={s.recordLeft}>
            <div className={s.recordIcon}>
              <BatteryLow size={35} color="#FF9201" />
            </div>
            <div className={s.recordText}>
              <p className={s.recordLabel}>배터리 부족</p>
              <p className={s.recordDescription}>로봇의 배터리가 부족하여 충전 시작함 ㅅㄱ</p>
            </div>
          </div>
          <p className={s.recordDate}>2025-08-19 12:11:24</p>
        </div>
        <div className={s.recordItem}>
          <div className={s.recordLeft}>
            <div className={s.recordIcon}>
              <FireExtinguisher size={40} color="#8B8B8B" />
            </div>
            <div className={s.recordText}>
              <p className={s.recordLabel}>화재 상황 종료</p>
              <p className={s.recordDescription}>로봇의 배터리가 부족하여 충전 시작함 ㅅㄱ</p>
            </div>
          </div>
          <p className={s.recordDate}>2025-08-19 12:11:24</p>
        </div>
      </div>
    </div>
  );
}

interface FireSensorDetailSectionProps {
  sensor: FireRobot | FireSensor;
  onClose?: () => void;
  onDelete?: () => void;
  onMoveBuilding?: () => void;
}

export default function FireSensorDetailSection({ sensor, onClose, onDelete, onMoveBuilding }: FireSensorDetailSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(sensor.name);

  const getBatteryStatus = (battery: number) => {
    if (battery >= 60) return "높음";
    if (battery >= 30) return "보통";
    return "낮음";
  };

  const handleSaveName = () => {
    console.log("이름 저장:", editedName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  return (
    <div className={s.fireRobotDetail}>
      <div className={s.topSection}>
        <div className={s.header}>
          <div className={s.headerInfo}>
            <div className={s.titleWrapper}>
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className={s.titleInput}
                    autoFocus
                  />
                  <Button
                    text="저장"
                    onClick={handleSaveName}
                    variant="primary"
                  />
                </>
              ) : (
                <>
                  <h2 className={s.title}>{sensor.name}</h2>
                  <button className={s.editButton} onClick={handleEditClick}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
            <span className={s.subtitle}>{sensor.model}</span>
          </div>
          <button className={s.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

      <div className={s.middleSection}>
        <div className={s.section}>
          <div className={s.infoGrid}>
            
            <div style={{ display: "flex", flexDirection: "row", gap: "40px"}}>
            <RobotInfoCard 
              icon={BatteryFull}
              label="배터리" 
              value={sensor.battery ? `${getBatteryStatus(sensor.battery)} (${sensor.battery}%)` : "정보 없음"} 
            />
            <RobotInfoCard icon={Wifi} label="통신 상태" value={sensor.status ? "좋음" : "정보 없음"} />
            </div>
           

           <div style={{ display: "flex", flexDirection: "row", gap: "40px"}}>
            <RobotInfoCard 
              icon={Timer}
              label="업타임" 
              value="342일" 
            />
            <RobotInfoCard 
              icon={Calendar}
              label="등록 일자" 
              value={sensor.lastUpdate || "정보 없음"} 
            />
            </div>

            
          </div>
        </div>

        <div className={s.section}>
          <h3 className={s.sectionTitle}>위치</h3>
          <LocationSection />
        </div>

        <KeyRecordSection />
      </div>

      <div className={s.bottomSection}>
        {onMoveBuilding && (
          <button className={s.moveButton} onClick={onMoveBuilding}>
            <Layers2 size={16} />
            건물 이동하기
          </button>
        )}
        <button className={s.deleteButton} onClick={onDelete}>
          <Trash2 size={16} />
          센서 삭제하기
        </button>
      </div>
    </div>
  );
}

