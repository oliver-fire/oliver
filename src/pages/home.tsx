import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeviceDto, getAllDevices, registerRobot, registerSensor } from "@/api";
import {
  NoRobotSection,
  RobotList,
} from "@/modules/camera/components/facility";
import {
  MakeRobotSection1,
  MakeRobotSection2,
  MakeRobotSection3,
} from "@/modules/camera/components/only-page";
import {
  FireRobotDetailSection1,
  FireSensorDetailSection2,
} from "@/modules/camera/widgets";
import { FireRobot } from "@/mok/fire-robot";
import { FireSensor as FireSensorType } from "@/mok/fire-sensor";
import { Alert, Segment } from "@/shared/components";
import Button from "@/shared/components/butoon";
import MainLayout from "@/shared/components/main-layout";

// DeviceDto를 FireRobot/FireSensor 형식으로 변환
const mapDeviceToFireRobot = (
  device: DeviceDto,
): FireRobot | FireSensorType => {
  // location 객체를 문자열로 변환
  const locationStr = device.location
    ? `${device.location.buildingName} ${device.location.floorName}`
    : "";

  // createdAt을 날짜 문자열로 변환
  const lastUpdate = device.createdAt
    ? new Date(device.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "";

  // status를 한글로 변환
  const statusMap: Record<string, string> = {
    idle: "대기중",
    moving: "이동중",
    charging: "충전중",
    error: "고장",
    paused: "대기중",
    evolving: "진화중",
    offline: "오프라인",
    normal: "정상",
    warning: "점검필요",
    alarm: "경고",
  };

  const status = statusMap[device.status] || device.status || "";

  const baseData = {
    id: device.deviceId,
    name: device.name,
    model: device.type === "robot" ? "소화 로봇" : "화재 감지기",
    status: status as any,
    battery: device.batteryLevel,
    location: locationStr,
    lastUpdate: lastUpdate,
  };

  return baseData as FireRobot | FireSensorType;
};

export default function Home() {
  const navigate = useNavigate();
  const [hasRobots, setHasRobots] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [section, setSection] = useState(0);
  const [selectedRobotType, setSelectedRobotType] = useState<
    "robot" | "sensor"
  >("robot");
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fireRobots, setFireRobots] = useState<DeviceDto[]>([]);
  const [fireSensors, setFireSensors] = useState<DeviceDto[]>([]);

  // 임시 일련번호 목데이터
  const mockSerialNumbers = {
    robot: "OLV960XFH-X92AG",
    sensor: "OLV960XFD-X93BG",
  };

  // API에서 디바이스 데이터 가져오기
  const fetchDevices = async () => {
    try {
      const devices = await getAllDevices();

      // 로봇과 센서 분리
      const robots = devices.filter((device) => device.type === "robot");
      const sensors = devices.filter((device) => device.type === "sensor");

      setFireRobots(robots);
      setFireSensors(sensors);
      setHasRobots(devices.length > 0);
    } catch (error) {
      console.error("디바이스 데이터 가져오기 실패:", error);
      setHasRobots(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getListType = () => {
    if (selectedSegment === "fire") return "robot";
    if (selectedSegment === "fireDetector") return "sensor";
    return "all";
  };

  // 선택된 로봇 찾기 및 변환
  const getSelectedRobot = (): FireRobot | FireSensorType | null => {
    if (!selectedRobotId) return null;
    const allRobots = [...fireRobots, ...fireSensors];
    const device = allRobots.find(
      (robot) => robot.deviceId === selectedRobotId,
    );
    return device ? mapDeviceToFireRobot(device) : null;
  };

  const selectedRobot = getSelectedRobot();

  // 로봇 타입 확인 (소화 로봇 vs 화재 감지기)
  const isFireRobot =
    selectedRobot &&
    fireRobots.some((robot) => robot.deviceId === selectedRobotId);

  return (
    <MainLayout>
      {hasRobots ? (
        <>
          {showAlert && (
            <Alert
              title="공간 등록 필요"
              message={`올리버 제품을 사용하려면 먼저 공간을 생성하고 로봇을 배치해야 합니다.\n이 과정을 완료하기 전까지는 대부분의 기능이 제한됩니다.`}
              buttonText="페이지로 이동"
              onButtonClick={() => {
                navigate("/map");
              }}
              onClose={() => setShowAlert(false)}
            />
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span style={{ fontSize: "24px", fontWeight: "500" }}>
                로봇 리스트
              </span>
              <span style={{ color: "#8B8B8B" }}>
                로봇을 눌러서 상세 정보를 볼 수 있습니다
              </span>
            </div>
            <Button
              text="로봇 추가하기"
              leftIcon={Plus}
              onClick={() => {
                setHasRobots(false);
                setSection(1);
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ width: "320px", height: "44px" }}>
              <Segment
                items={[
                  { label: "전체 리스트", value: "all" },
                  { label: "소화 로봇", value: "fire" },
                  { label: "화재감지기", value: "fireDetector" },
                ]}
                selected={selectedSegment}
                onChange={setSelectedSegment}
              />
            </div>
            <div style={{ width: "400px" }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8B8B8B",
                  }}
                />
                <input
                  type="text"
                  placeholder="제품 검색하기"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 16px 0 44px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EAEAEA",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#0E0E0E",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#EAEAEA";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#EAEAEA";
                  }}
                />
              </div>
            </div>
          </div>

          <RobotList
            type={getListType()}
            onRobotSelect={setSelectedRobotId}
            selectedRobotId={selectedRobotId}
            searchQuery={searchQuery}
            robots={fireRobots}
            sensors={fireSensors}
          />

          {selectedRobotId && selectedRobot && (
            <>
              {/* 오버레이 */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  zIndex: 999,
                }}
                onClick={() => setSelectedRobotId(null)}
              />

              {/* 위젯 */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "12px",
                }}
              >
                {isFireRobot ? (
                  <FireRobotDetailSection1
                    robot={selectedRobot}
                    onClose={() => setSelectedRobotId(null)}
                    onDelete={() => {
                      // TODO: 로봇 삭제 로직
                      console.log("로봇 삭제:", selectedRobotId);
                      setSelectedRobotId(null);
                    }}
                  />
                ) : (
                  <FireSensorDetailSection2
                    sensor={selectedRobot}
                    onClose={() => setSelectedRobotId(null)}
                    onDelete={() => {
                      // TODO: 센서 삭제 로직
                      console.log("센서 삭제:", selectedRobotId);
                      setSelectedRobotId(null);
                    }}
                  />
                )}
              </div>
            </>
          )}
        </>
      ) : section === 3 ? (
        <MakeRobotSection3
          robotType={selectedRobotType}
          serialNumber={mockSerialNumbers[selectedRobotType]}
          onConfirm={async () => {
            try {
              // 로봇/센서 등록 API 호출
              if (selectedRobotType === "robot") {
                await registerRobot("김똥개로봇");
              } else {
                await registerSensor("김똥개로봇");
              }

              // 등록 성공 후 리스트 새로고침
              await fetchDevices();

              // 홈 화면으로 돌아가기
              setHasRobots(true);
              setSection(0);
            } catch (error) {
              console.error("디바이스 등록 실패:", error);
              alert("디바이스 등록에 실패했습니다. 다시 시도해주세요.");
            }
          }}
          onExit={() => {
            setHasRobots(true);
            setSection(0);
          }}
          onSearchAgain={() => setSection(2)}
        />
      ) : section === 2 ? (
        <MakeRobotSection2
          onBack={() => setSection(1)}
          onNext={() => setSection(3)}
        />
      ) : section === 1 ? (
        <MakeRobotSection1
          onNext={(type) => {
            setSelectedRobotType(type);
            setSection(2);
          }}
        />
      ) : (
        <NoRobotSection onAddClick={() => setSection(1)} />
      )}
    </MainLayout>
  );
}
