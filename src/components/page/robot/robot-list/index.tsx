import { useState, useEffect } from "react";
import {
  Bot,
  Badge,
  Battery,
  MapPin,
  Calendar,
  Search,
  Loader,
  BatteryCharging,
  BellElectric,
  FireExtinguisher,
} from "lucide-react";
import { Segment } from "@/shared/components";
import { getAllDevices } from "@/api/bot/service";
import { DeviceDto, DeviceType } from "@/api/bot/dto/device";
import RobotItem, { RobotStatus } from "./robot-item";
import s from "./styles.module.scss";

// DeviceDto의 status를 RobotItem의 RobotStatus로 변환
const mapStatusToRobotStatus = (status: string | undefined): RobotStatus => {
  if (!status) {
    return "대기중";
  }

  const statusMap: Record<string, RobotStatus> = {
    idle: "대기중",
    paused: "대기중",
    moving: "이동중",
    charging: "충전중",
    evolving: "진화중",
  };
  return statusMap[status.toLowerCase()] || "대기중";
};

// 상태에 맞는 아이콘 반환
const getStatusIcon = (status: RobotStatus) => {
  switch (status) {
    case "대기중":
      return Loader;
    case "충전중":
      return BatteryCharging;
    case "이동중":
      return BellElectric;
    case "진화중":
      return FireExtinguisher;
    default:
      return Loader;
  }
};

// DeviceDto를 RobotItem props로 변환
const mapDeviceToRobotItem = (device: DeviceDto) => {
  const robotStatus = mapStatusToRobotStatus(device.status);
  const statusIcon = getStatusIcon(robotStatus);

  // 위치 정보 (층 이름만)
  const location = device.location?.floorName || "정보 없음";

  // 등록 일자
  const registeredDate = device.createdAt
    ? new Date(device.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "정보 없음";

  // 디바이스 타입
  const deviceType =
    device.type === DeviceType.ROBOT ? "소화 로봇" : "화재 감지기";

  // 화재감지기일 때는 name에서 tuya 키 부분 제거
  const rawName = device.name || "이름 없음";
  const isSensor = device.type === DeviceType.SENSOR;
  const name =
    isSensor && rawName.includes("-tuya-key-")
      ? rawName.split("-tuya-key-")[0]
      : rawName;

  return {
    image: isSensor ? "/sample/sensor.jpg" : "/sample/oliver.png",
    name: name,
    type: deviceType,
    status: robotStatus,
    statusIcon,
    battery: device.batteryLevel || 0,
    location,
    registeredDate,
  };
};

interface RobotListProps {
  onRobotClick?: (device: DeviceDto) => void;
  refreshTrigger?: number;
}

export default function RobotList({
  onRobotClick,
  refreshTrigger,
}: RobotListProps = {}) {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 디바이스 데이터 가져오기
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("디바이스 조회 시작");
        const data = await getAllDevices();
        console.log("디바이스 조회 결과:", data);
        setDevices(data);
      } catch (err: any) {
        console.error("디바이스 조회 실패:", err);
        setError(err.message || "디바이스를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [refreshTrigger]);

  // 필터링된 디바이스
  const filteredDevices = devices.filter((device) => {
    // 세그먼트 필터
    if (selectedSegment === "fire" && device.type !== DeviceType.ROBOT) {
      return false;
    }
    if (
      selectedSegment === "fireDetector" &&
      device.type !== DeviceType.SENSOR
    ) {
      return false;
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return device.name?.toLowerCase().includes(query) || false;
    }

    return true;
  });

  return (
    <div className={s.container}>
      <div className={s.fillter_header}>
        <div className={s.filter}>
          <Segment
            items={[
              { label: "전체 리스트", value: "all" },
              { label: "소화로봇", value: "fire" },
              { label: "화재감지기", value: "fireDetector" },
            ]}
            selected={selectedSegment}
            onChange={setSelectedSegment}
            width={320}
            height={44}
          />
        </div>

        <div className={s.search}>
          <Search size={18} className={s.searchIcon} />
          <input
            type="text"
            placeholder="제품 검색하기"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <div className={s.robotlist}>
        <div className={s.header}>
          <div className={s.headerCell} style={{ width: "300px" }}>
            <Bot size={20} className={s.icon} />
            <span className={s.headerText}>로봇</span>
          </div>
          <div className={s.headerCell} style={{ width: "180px" }}>
            <Badge size={20} className={s.icon} />
            <span className={s.headerText}>상태</span>
          </div>
          <div className={s.headerCell} style={{ width: "200px" }}>
            <Battery size={20} className={s.icon} />
            <span className={s.headerText}>배터리</span>
          </div>
          <div className={s.headerCell} style={{ width: "200px" }}>
            <MapPin size={20} className={s.icon} />
            <span className={s.headerText}>로봇 위치</span>
          </div>
          <div className={s.headerCell} style={{ width: "265px" }}>
            <Calendar size={20} className={s.icon} />
            <span className={s.headerText}>등록 일자</span>
          </div>
        </div>

        <div className={s.items}>
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8B8B8B",
              }}
            >
              로딩 중...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#F03839",
              }}
            >
              {error}
            </div>
          ) : filteredDevices.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8B8B8B",
              }}
            >
              등록된 디바이스가 없습니다.
            </div>
          ) : (
            filteredDevices.map((device) => {
              const robotItemProps = mapDeviceToRobotItem(device);
              return (
                <RobotItem
                  key={device.deviceId}
                  {...robotItemProps}
                  onClick={() => onRobotClick?.(device)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
