import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  BatteryFull,
  Wifi,
  Timer,
  Calendar,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import s from "./styles.module.scss";
import { Button, Segment } from "@/shared/components";
import MapArea from "../../map/maparea";
import DeviceLog from "../../emergency/device-log";
import { X } from "lucide-react";
import { getBuildingFloors } from "@/api/building/service";
import { getDeviceById, updateDevice, deleteDevice } from "@/api/bot/service";
import { DeviceType } from "@/api/bot/dto/device";

interface RobotDetailProps {
  deviceId: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

export default function RobotDetail({
  deviceId,
  onClose,
  onUpdate,
}: RobotDetailProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [floors, setFloors] = useState<
    { id: string; name: string; level: number }[]
  >([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [selectedFloorName, setSelectedFloorName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<"thermal" | "normal">(
    "thermal"
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // 화재감지기일 때 name에서 tuya 키 부분 제거하는 헬퍼 함수
  const getDisplayName = (rawName: string, deviceType: DeviceType): string => {
    const isSensor = deviceType === DeviceType.SENSOR;
    return isSensor && rawName.includes("-tuya-key-")
      ? rawName.split("-tuya-key-")[0]
      : rawName;
  };

  // 디바이스 상세 정보 가져오기
  useEffect(() => {
    const fetchDeviceDetail = async () => {
      try {
        setLoading(true);
        const deviceData = await getDeviceById(deviceId);
        setDevice(deviceData);
        const displayName = getDisplayName(
          deviceData.name || "",
          deviceData.type
        );
        setEditedName(displayName);
      } catch (error) {
        console.error("디바이스 상세 정보 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      fetchDeviceDetail();
    }
  }, [deviceId]);

  // 층 목록 가져오기
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const floorsResponse = await getBuildingFloors();
        const floorsData = floorsResponse.data.map((floor) => ({
          id: floor.id,
          name: floor.name,
          level: floor.level,
        }));
        setFloors(floorsData);
        if (floorsData.length > 0) {
          setSelectedFloorId(floorsData[0].id);
          setSelectedFloorName(floorsData[0].name);
        }
      } catch (error) {
        console.error("층 목록 가져오기 실패:", error);
      }
    };
    fetchFloors();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 배터리 상태 계산
  const getBatteryStatus = (battery: number): string => {
    if (battery <= 20) return "낮음";
    if (battery <= 50) return "보통";
    return "높음";
  };

  // 통신 상태 계산
  const getCommunicationStatus = (status: number): string => {
    if (status >= 80) return "좋음";
    if (status >= 50) return "보통";
    if (status >= 20) return "나쁨";
    return "매우 나쁨";
  };

  // 업타임 포맷팅 (초를 일/시간/분으로 변환)
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}일`;
    } else if (hours > 0) {
      return `${hours}시간`;
    } else if (minutes > 0) {
      return `${minutes}분`;
    }
    return "1분 미만";
  };

  // 등록일자 포맷팅
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "정보 없음";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
    } catch (error) {
      return "정보 없음";
    }
  };

  // 로딩 중이거나 디바이스 정보가 없을 때
  if (loading || !device) {
    return (
      <div className={s.container}>
        <div style={{ padding: "40px", textAlign: "center", color: "#8B8B8B" }}>
          로딩 중...
        </div>
      </div>
    );
  }

  // 화재감지기일 때는 name에서 tuya 키 부분 제거
  const name = getDisplayName(device.name || "이름 없음", device.type);
  const isSensor = device.type === DeviceType.SENSOR;
  const type = device.type === DeviceType.ROBOT ? "소화 로봇" : "화재 감지기";
  const batteryLevel = device.batteryLevel || 0;
  const createdAt = device.createdAt;
  const communicationStatus = device.communicationStatus || 0;
  const uptimeSeconds = device.uptimeSeconds || 0;

  const batteryStatus = getBatteryStatus(batteryLevel);
  const formattedDate = formatDate(createdAt);
  const communicationStatusText = getCommunicationStatus(communicationStatus);
  const uptimeText = formatUptime(uptimeSeconds);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(50, prev - 10));
  };

  const handleFloorSelect = (floorId: string, floorName: string) => {
    setSelectedFloorId(floorId);
    setSelectedFloorName(floorName);
    setIsDropdownOpen(false);
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
    if (device) {
      const displayName = getDisplayName(device.name || "", device.type);
      setEditedName(displayName);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    if (device) {
      const displayName = getDisplayName(device.name || "", device.type);
      setEditedName(displayName);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!device?.deviceId) {
      alert("디바이스 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      await updateDevice(device.deviceId, { name: editedName.trim() });
      setDevice((prev: any) => ({ ...prev, name: editedName.trim() }));
      setIsEditingName(false);
      onUpdate?.();
    } catch (error) {
      console.error("이름 변경 실패:", error);
      alert("이름 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!device?.deviceId) {
      alert("디바이스 정보를 불러올 수 없습니다.");
      return;
    }

    if (!confirm("정말로 이 디바이스를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteDevice(device.deviceId);
      alert("디바이스가 삭제되었습니다.");
      onUpdate?.();
      onClose?.();
    } catch (error) {
      console.error("디바이스 삭제 실패:", error);
      alert("디바이스 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.header_content}>
          <div className={s.header_content_title_wrapper}>
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveName();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                  className={s.name_input}
                  autoFocus
                  disabled={isSaving}
                />
                <div className={s.edit_buttons}>
                  <button
                    className={s.save_button}
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    저장
                  </button>
                  <button
                    className={s.cancel_button}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={s.header_content_title}>{name}</div>
                <button
                  className={s.edit_button}
                  onClick={handleEditNameClick}
                  type="button"
                >
                  <Pencil size={16} color="#8b8b8b" />
                </button>
              </>
            )}
          </div>

          <div className={s.header_content_subtitle}>{type}</div>
        </div>
        {onClose && (
          <button className={s.header_close} onClick={onClose}>
            <X size={24} color="#8b8b8b" />
          </button>
        )}
      </div>
      <div className={s.content}>
        <div className={s.content_info}>
          <div className={s.info_row}>
            <div className={s.info_card}>
              <div className={s.info_card_header}>
                <BatteryFull size={18} className={s.info_icon} />
                <span className={s.info_label}>배터리</span>
              </div>
              <span className={s.info_value}>
                {batteryStatus} ({batteryLevel}%)
              </span>
            </div>
            <div className={s.info_card}>
              <div className={s.info_card_header}>
                <Wifi size={18} className={s.info_icon} />
                <span className={s.info_label}>통신 상태</span>
              </div>
              <span className={s.info_value}>{communicationStatusText}</span>
            </div>
          </div>
          <div className={s.info_row}>
            <div className={s.info_card}>
              <div className={s.info_card_header}>
                <Timer size={18} className={s.info_icon} />
                <span className={s.info_label}>업타임</span>
              </div>
              <span className={s.info_value}>{uptimeText}</span>
            </div>
            <div className={s.info_card}>
              <div className={s.info_card_header}>
                <Calendar size={18} className={s.info_icon} />
                <span className={s.info_label}>등록 일자</span>
              </div>
              <span className={s.info_value}>{formattedDate}</span>
            </div>
          </div>
        </div>
        {!isSensor && (
          <div className={s.content_camera}>
            <h1 className={s.content_camera_title}>로봇 카메라</h1>
            <div className={s.content_camera_content}>
              <div className={s.content_camera_empty}>
                <p className={s.empty_message}>카메라 정보가 없습니다</p>
                <p className={s.empty_description}>
                  현재 화재 감지 센서가 정상 상태이며, 영상 스트림은
                  비활성화되어 있습니다. 화재 상황이 발생하면 실시간 영상이
                  자동으로 표시됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={s.content_map}>
          <h1 className={s.content_map_title}>위치</h1>
          <div className={s.content_map_content}>
            <MapArea
              mapImageUrl="/sample/map.png"
              zoomLevel={zoomLevel}
              onZoomLevelChange={setZoomLevel}
              showBorder={false}
            />
            {/* 줌 컨트롤 */}
            <div className={s.zoomControls}>
              <button className={s.zoomButton} onClick={handleZoomOut}>
                <Minus size={18} />
              </button>
              <div className={s.zoomLevel}>{zoomLevel}%</div>
              <button className={s.zoomButton} onClick={handleZoomIn}>
                <Plus size={18} />
              </button>
            </div>
            {/* 층 선택 드롭다운 */}
            {floors.length > 0 && (
              <div className={s.floorSelect} ref={dropdownRef}>
                <button
                  className={s.floorSelectButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{selectedFloorName}</span>
                  <ChevronDown size={20} />
                </button>
                {isDropdownOpen && (
                  <div className={s.floorDropdown}>
                    {floors.map((floor) => (
                      <div
                        key={floor.id}
                        className={`${s.floorDropdownItem} ${
                          selectedFloorId === floor.id ? s.selected : ""
                        }`}
                        onClick={() => handleFloorSelect(floor.id, floor.name)}
                      >
                        {floor.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={s.content_log}>
          <h1 className={s.content_log_title}>최근 기록</h1>
          <div className={s.content_log_content}>
            <DeviceLog hideTitle={true} deviceId={deviceId} />
          </div>
        </div>
      </div>
      <div className={s.footer}>
        <Button
          text="로봇 삭제하기"
          variant="primary"
          style={{ backgroundColor: "#F03839", color: "#fff" }}
          onClick={handleDeleteDevice}
          disabled={isDeleting}
        />
      </div>
    </div>
  );
}
