import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { getDeviceById, getAllDevices } from "@/api/bot/service";
import { DeviceDto, DeviceType } from "@/api/bot/dto/device";
import DeviceItem from "@/components/page/map/device";
import s from "./styles.module.scss";

interface MapViewerProps {
  sensorId: string;
}

export default function MapViewer({ sensorId }: MapViewerProps) {
  const [sensor, setSensor] = useState<DeviceDto | null>(null);
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sensor 데이터 및 같은 층의 모든 디바이스 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorData = await getDeviceById(sensorId);
        setSensor(sensorData);

        // 같은 층의 모든 디바이스 가져오기
        if (sensorData.location) {
          const allDevices = await getAllDevices();
          const sameFloorDevices = allDevices.filter(
            (device) =>
              device.location &&
              device.location.floorId === sensorData.location.floorId
          );
          setDevices(sameFloorDevices);
        }
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };

    if (sensorId) {
      fetchData();
    }
  }, [sensorId]);

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

  // 지도 드래그 처리
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMapDragging) {
        setMapOffset({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsMapDragging(false);
    };

    if (isMapDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isMapDragging]);

  const handleMapMouseDown = (e: React.MouseEvent) => {
    // 디바이스가 아닌 경우에만 지도 드래그
    const target = e.target as HTMLElement;
    const isDeviceClick = target.closest("[data-device-item]");

    if (
      !isDeviceClick &&
      (e.target === e.currentTarget || target.tagName === "IMG")
    ) {
      setIsMapDragging(true);
      const startPos = {
        x: e.clientX - mapOffset.x,
        y: e.clientY - mapOffset.y,
      };
      dragStartRef.current = startPos;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newZoom = Math.min(200, Math.max(50, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoomLevel + 10);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoomLevel - 10);
    setZoomLevel(newZoom);
  };

  const scale = zoomLevel / 100;
  const mapImageUrl = "/sample/mpas/my_map.png";

  if (!sensor) {
    return (
      <div className={s.container}>
        <div className={s.loading}>로딩 중...</div>
      </div>
    );
  }

  // 같은 층의 로봇들 (읽기 전용)
  const robots = devices.filter((device) => device.type === DeviceType.ROBOT);
  // 같은 층의 센서들 (읽기 전용)
  const sensors = devices.filter((device) => device.type === DeviceType.SENSOR);

  return (
    <div className={s.container}>
      <div
        ref={mapContainerRef}
        className={`${s.map} ${isMapDragging ? s.dragging : ""}`}
        onMouseDown={handleMapMouseDown}
        onWheel={handleWheel}
      >
        <div
          className={s.mapWrapper}
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <img src={mapImageUrl} alt="지도" className={s.mapImage} />
          {/* 같은 층의 로봇들 표시 (읽기 전용, 낮은 z-index) */}
          {robots.map((robot) => {
            if (!robot.location) return null;
            return (
              <div
                key={robot.deviceId}
                data-device-item="true"
                style={{
                  position: "absolute",
                  left: `${robot.location.x}px`,
                  top: `${robot.location.y}px`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                <DeviceItem
                  name={robot.name}
                  type={robot.type as "robot" | "sensor"}
                  isOverlapped={false}
                  draggable={false}
                />
              </div>
            );
          })}
          {/* 같은 층의 센서들 표시 (읽기 전용, 높은 z-index) */}
          {sensors.map((sensorDevice) => {
            if (!sensorDevice.location) return null;
            const isSelectedSensor = sensorDevice.deviceId === sensorId;
            return (
              <div
                key={sensorDevice.deviceId}
                data-device-item="true"
                style={{
                  position: "absolute",
                  left: `${sensorDevice.location.x}px`,
                  top: `${sensorDevice.location.y}px`,
                  transformOrigin: "top left",
                  pointerEvents: "none",
                  zIndex: 2,
                  opacity: isSelectedSensor ? 1 : 0.7,
                }}
              >
                <DeviceItem
                  name={sensorDevice.name}
                  type={sensorDevice.type as "robot" | "sensor"}
                  isOverlapped={false}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

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
      {sensor.location && (
        <div className={s.floorSelect} ref={dropdownRef}>
          <button
            className={s.floorSelectButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{sensor.location.floorName}</span>
            <ChevronDown size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
