import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/shared/components/main-layout";
import s from "./styles.module.scss";
import Filter from "@/components/page/map/map-sub-function/fillter";
import Scale from "@/components/page/map/map-sub-function/scale";
import { Plus, Radar } from "lucide-react";
import Button from "@/shared/components/butoon";
import FillterItem, {
  Floor,
} from "@/components/page/map/map-sub-function/fillter/fillter-item";
import MapArea from "@/components/page/map/maparea";
import DeviceItem from "@/components/page/map/device";

interface HasFloorsProps {
  mapImageUrl?: string;
}

const mockFloors: Floor[] = [
  { id: "1", level: 1, name: "토른 하숙집 1F" },
  { id: "2", level: 2, name: "토른 하숙집 2F" },
  { id: "3", level: 3, name: "토른 하숙집 3F" },
];

interface MockDevice {
  id: string;
  name: string;
  type: "robot" | "sensor";
}

interface PlacedDevice {
  id: string;
  name: string;
  type: "robot" | "sensor";
  x: number;
  y: number;
}

const mockDevices: MockDevice[] = [
  { id: "robot-1", name: "소화 로봇 1호", type: "robot" },
  { id: "robot-2", name: "소화 로봇 2호", type: "robot" },
  { id: "robot-3", name: "소화 로봇 3호", type: "robot" },
  { id: "robot-4", name: "소화 로봇 4호", type: "robot" },
  { id: "sensor-1", name: "화재 감지기 1호", type: "sensor" },
  { id: "sensor-2", name: "화재 감지기 2호", type: "sensor" },
  { id: "sensor-3", name: "화재 감지기 3호", type: "sensor" },
  { id: "sensor-4", name: "화재 감지기 4호", type: "sensor" },
];

export default function HasFloors({
  mapImageUrl = "/sample/mpas/my_map.png",
}: HasFloorsProps) {
  const navigate = useNavigate();
  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    mockFloors[0]?.id || "1"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  const [isDraggingDevice, setIsDraggingDevice] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mapAreaRef = useRef<HTMLDivElement | null>(null);

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoomLevel + 10);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoomLevel - 10);
    setZoomLevel(newZoom);
  };

  // 디바이스가 할당 필요 로봇 섹션에 있는지 확인
  const getUnplacedDevices = () => {
    const placedIds = new Set(placedDevices.map((d) => d.id));
    return mockDevices.filter((device) => !placedIds.has(device.id));
  };

  // 디바이스 드래그 시작 (할당 필요 로봇 섹션에서)
  const handleDeviceDragStart = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingDevice(true);
    setDraggedDeviceId(deviceId);

    // 디바이스 요소의 위치 찾기
    const deviceElement = e.currentTarget as HTMLElement;
    const deviceRect = deviceElement.getBoundingClientRect();

    // 마우스 클릭 위치와 디바이스 왼쪽 상단 모서리의 오프셋 계산
    dragStartRef.current = {
      x: e.clientX - deviceRect.left,
      y: e.clientY - deviceRect.top,
    };
  };

  // 지도 위에 배치된 디바이스 드래그 시작
  const handlePlacedDeviceDragStart = (
    deviceId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setIsDraggingDevice(true);
    setDraggedDeviceId(deviceId);

    // 디바이스 컨테이너 요소 찾기
    const deviceContainer = (e.currentTarget as HTMLElement).querySelector(
      "[data-device-container]"
    ) as HTMLElement;

    if (deviceContainer) {
      const deviceRect = deviceContainer.getBoundingClientRect();
      // 마우스 클릭 위치와 디바이스 컨테이너의 왼쪽 상단 모서리 사이의 오프셋
      dragStartRef.current = {
        x: e.clientX - deviceRect.left,
        y: e.clientY - deviceRect.top,
      };
    } else {
      // 폴백: 디바이스 중심점 기준
      dragStartRef.current = { x: 50, y: 50 };
    }
  };

  // 마우스 이동 및 드롭 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDevice || !draggedDeviceId) return;

      const device = mockDevices.find((d) => d.id === draggedDeviceId);
      if (!device) return;

      // 지도 영역 확인 - MapArea의 실제 DOM 요소 찾기
      const mapElement = mapAreaRef.current?.querySelector(
        `[class*="map"]`
      ) as HTMLElement;
      if (mapElement) {
        const rect = mapElement.getBoundingClientRect();
        const scale = zoomLevel / 100;

        // 지도 영역 내부인지 확인 (border 20px 고려)
        const mapInnerLeft = rect.left + 20;
        const mapInnerTop = rect.top + 20;
        const mapInnerRight = rect.right - 20;
        const mapInnerBottom = rect.bottom - 20;

        // 지도 영역 내부인지 확인
        const isInsideMap =
          e.clientX >= mapInnerLeft &&
          e.clientX <= mapInnerRight &&
          e.clientY >= mapInnerTop &&
          e.clientY <= mapInnerBottom;

        // 마우스 위치에서 오프셋을 빼서 디바이스의 왼쪽 상단 모서리 위치 계산
        const deviceLeftTopX = e.clientX - dragStartRef.current.x;
        const deviceLeftTopY = e.clientY - dragStartRef.current.y;

        // 지도 좌표계로 변환 (지도 영역 내부인 경우만 업데이트)
        if (isInsideMap) {
          // 지도 컨테이너 기준 상대 좌표
          const relativeX = deviceLeftTopX - mapInnerLeft;
          const relativeY = deviceLeftTopY - mapInnerTop;

          // mapOffset과 scale을 역변환하여 지도 좌표계로 변환
          // transform: translate(mapOffset) scale(scale)의 역변환
          const x = (relativeX - mapOffset.x) / scale;
          const y = (relativeY - mapOffset.y) / scale;

          // 이미 배치된 디바이스인지 확인
          const existingIndex = placedDevices.findIndex(
            (d) => d.id === draggedDeviceId
          );

          if (existingIndex >= 0) {
            // 위치 업데이트
            setPlacedDevices((prev) =>
              prev.map((d, idx) => (idx === existingIndex ? { ...d, x, y } : d))
            );
          } else {
            // 새로 배치
            setPlacedDevices((prev) => [
              ...prev,
              {
                id: device.id,
                name: device.name,
                type: device.type,
                x,
                y,
              },
            ]);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDevice(false);
      setDraggedDeviceId(null);
    };

    if (isDraggingDevice) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDevice, draggedDeviceId, zoomLevel, mapOffset, placedDevices]);

  // 선택된 floor의 이름 가져오기
  const selectedFloor = mockFloors.find(
    (floor) => floor.id === selectedFloorId
  );
  const selectedFloorName = selectedFloor?.name || mockFloors[0]?.name || "1층";

  return (
    <MainLayout backgroundVariant="gray">
      <div className={s.container}>
        <div className={s.sub_function_header}>
          <Filter FloorName={selectedFloorName} onToggle={setIsFilterOpen} />
          <Scale
            scale={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </div>
        <div className={s.mapsection}>
          {isFilterOpen ? (
            <FillterItem
              floors={mockFloors}
              selectedFloorId={selectedFloorId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFloorSelect={setSelectedFloorId}
              onAddFloor={() => {
                console.log("공간 추가");
              }}
              onManage={() => {
                console.log("관리");
              }}
            />
          ) : (
            <div className={s.divbox}></div>
          )}
          <div className={s.column}>
            <div className={s.device}>
              <div className={s.content}>
                <div className={s.title}>할당 필요 로봇</div>
                <div className={s.description}>건물로 드래그 해 배치</div>
              </div>

              <div className={s.devicesection}>
                {getUnplacedDevices().map((device) => (
                  <DeviceItem
                    key={device.id}
                    name={device.name}
                    type={device.type}
                    onDragStart={(e) => handleDeviceDragStart(device.id, e)}
                    draggable={true}
                  />
                ))}
              </div>
            </div>
            <div ref={mapAreaRef}>
              <MapArea
                mapImageUrl={mapImageUrl}
                zoomLevel={zoomLevel}
                onZoomLevelChange={setZoomLevel}
                placedDevices={placedDevices}
                onDeviceDragStart={handlePlacedDeviceDragStart}
                mapOffset={mapOffset}
                onMapOffsetChange={setMapOffset}
              />
            </div>
          </div>
        </div>

        <div className={s.sub_function_footer}>
          <Button
            text="제품 추가하기"
            leftIcon={Plus}
            onClick={() => navigate("/robot/register/section1")}
          />
          <button className={s.button_scan}>
            <Radar size={16} />
            <span className={s.button_scan_text}>공간 다시 스캔하기</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
