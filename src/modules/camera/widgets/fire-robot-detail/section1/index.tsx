import { useState } from "react";
import { FireRobot, FireSensor } from "@/mok";
import { Segment } from "@/shared/components";
import Button from "@/shared/components/butoon";
import { Pencil, X, Trash2, Wifi, Timer, Calendar, BatteryLow, BatteryFull } from "lucide-react";
import s from "./styles.module.scss";

// 로봇 정보 카드 컴포넌트
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

// 카메라 섹션 컴포넌트
function CameraSection() {
  const [selectedCamera, setSelectedCamera] = useState("thermal");

  return (
    <div className={s.cameraSection}>
      <Segment
        items={[
          { label: "열화상 카메라", value: "thermal" },
          { label: "일반 카메라", value: "normal" },
        ]}
        selected={selectedCamera}
        onChange={setSelectedCamera}
      />
      
      <div className={s.cameraEmpty}>
        <p className={s.emptyMessage}>카메라 정보가 없습니다</p>
        <p className={s.emptyDescription}>
          현재 화재 감지 센서가 정상 상태이며, 영상 스트림은 비활성화되어 있습니다.
          <br />
          화재 상황이 발생하면 실시간 영상이 자동으로 표시됩니다.
        </p>
      </div>
    </div>
  );
}

// 위치 섹션 컴포넌트
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

// 주요 기록 섹션 컴포넌트
function KeyRecordSection() {
  return (
    <div className={s.keyRecordSection}>
      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>최근 기록</span>
      </div>
      <div className={s.recordItem}>
        <div className={s.recordIcon}>
          <BatteryLow size={24} color="#F59E0B" />
        </div>
        <span className={s.recordLabel}>배터리 부족</span>
      </div>
    </div>
  );
}

// 메인 컴포넌트
interface FireRobotDetailSectionProps {
  robot: FireRobot | FireSensor;
  onClose?: () => void;
  onDelete?: () => void;
}

export default function FireRobotDetailSection({ robot, onClose, onDelete }: FireRobotDetailSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(robot.name);

  const getBatteryStatus = (battery: number) => {
    if (battery >= 60) return "높음";
    if (battery >= 30) return "보통";
    return "낮음";
  };

  const handleSaveName = () => {
    // TODO: 이름 저장 로직
    console.log("이름 저장:", editedName);
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setIsEditingName(true);
  };

  return (
    <div className={s.fireRobotDetail}>
      {/* 상단: 헤더 */}
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
                    width={61}
                    height={32}
                  />
                </>
              ) : (
                <>
                  <h2 className={s.title}>{robot.name}</h2>
                  <button className={s.editButton} onClick={handleEditClick}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
            <span className={s.subtitle}>{robot.model}</span>
          </div>
          <button className={s.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

      {/* 중간: 로봇 정보 콘텐츠 */}
      <div className={s.middleSection}>
        {/* 로봇 정보 */}
        <div className={s.section}>
          <h3 className={s.sectionTitle}>로봇 정보</h3>
          <div className={s.infoGrid}>
            <RobotInfoCard 
              icon={BatteryFull}
              label="배터리" 
              value={robot.battery ? `${getBatteryStatus(robot.battery)} (${robot.battery}%)` : "정보 없음"} 
            />
            <RobotInfoCard icon={Wifi} label="통신 상태" value={robot.status ? "좋음" : "정보 없음"} />
            <RobotInfoCard 
              icon={Timer}
              label="업타임" 
              value="342일" 
            />
            <RobotInfoCard 
              icon={Calendar}
              label="등록 일자" 
              value={robot.lastUpdate || "정보 없음"} 
            />
          </div>
        </div>

        {/* 로봇 카메라 */}
        <div className={s.section}>
          <h3 className={s.sectionTitle}>로봇 카메라</h3>
          <CameraSection />
        </div>

        {/* 위치 */}
        <div className={s.section}>
          <h3 className={s.sectionTitle}>위치</h3>
          <LocationSection />
        </div>

        {/* 주요 기록 */}
        <KeyRecordSection />
      </div>

      {/* 하단: 삭제 버튼 */}
      <div className={s.bottomSection}>
        <button className={s.deleteButton} onClick={onDelete}>
          <Trash2 size={16} />
          로봇 삭제하기
        </button>
      </div>
    </div>
  );
}

