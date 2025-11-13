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
import { getBuildingFloors, getAllBuildings } from "@/api/building/service";
import { getBuildingFloorMap } from "@/api/map/service";
import { getBuildingFloorRobots } from "@/api/bot/service";
import { DeviceType } from "@/api/bot/dto/device";

// API baseURL 가져오기
const getApiBaseURL = () => {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  return isLocal
    ? "https://oliver-api-staging.thnos.app"
    : "https://oliver-api.thnos.app";
};

interface HasFloorsProps {
  mapImageUrl?: string;
}

interface Device {
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

export default function HasFloors({
  mapImageUrl = "/sample/mpas/my_map.png",
}: HasFloorsProps) {
  const navigate = useNavigate();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  const [isDraggingDevice, setIsDraggingDevice] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [currentMapUrl, setCurrentMapUrl] = useState<string>("");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [buildingId, setBuildingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mapAreaRef = useRef<HTMLDivElement | null>(null);

  // 층 목록 가져오기
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        setLoading(true);
        const buildingsResponse = await getAllBuildings();
        if (buildingsResponse.data.length === 0) {
          return;
        }
        const firstBuildingId = buildingsResponse.data[0].id;
        setBuildingId(firstBuildingId);

        const floorsResponse = await getBuildingFloors();
        const floorsData: Floor[] = floorsResponse.data.map((floor) => ({
          id: floor.id,
          level: floor.level,
          name: floor.name,
        }));
        setFloors(floorsData);

        // 첫 번째 층 선택
        if (floorsData.length > 0 && !selectedFloorId) {
          setSelectedFloorId(floorsData[0].id);
        }
      } catch (error) {
        console.error("층 목록 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloors();
  }, []);

  // 선택된 층의 맵 이미지 가져오기
  useEffect(() => {
    const fetchMap = async () => {
      if (!selectedFloorId || !buildingId) {
        setCurrentMapUrl("");
        return;
      }

      setIsMapLoading(true);
      try {
        const mapResponse = await getBuildingFloorMap(
          buildingId,
          selectedFloorId
        );
        console.log("맵 API 응답:", mapResponse);
        console.log("mapPgmUrl:", mapResponse.data.mapPgmUrl);
        console.log("mapYamlUrl:", mapResponse.data.mapYamlUrl);

        // mapPgmUrl이 유효한 값인지 확인
        const mapPgmUrl = mapResponse.data?.mapPgmUrl;
        if (mapPgmUrl && mapPgmUrl.trim() !== "") {
          // URL이 상대 경로인 경우 baseURL과 조합
          let finalUrl = mapPgmUrl.trim();
          const baseURL = getApiBaseURL();

          if (
            finalUrl.startsWith("http://") ||
            finalUrl.startsWith("https://")
          ) {
            // 이미 완전한 URL인 경우 그대로 사용
            console.log("✅ API에서 받은 완전한 URL 사용:", finalUrl);
            setCurrentMapUrl(finalUrl);
          } else if (finalUrl.startsWith("/")) {
            // 절대 경로인 경우 (예: "/maps/image.pgm")
            finalUrl = `${baseURL}${finalUrl}`;
            console.log(
              "✅ API에서 받은 절대 경로를 baseURL과 조합:",
              finalUrl
            );
            setCurrentMapUrl(finalUrl);
          } else {
            // 상대 경로인 경우 (예: "maps/image.pgm")
            finalUrl = `${baseURL}/${finalUrl}`;
            console.log(
              "✅ API에서 받은 상대 경로를 baseURL과 조합:",
              finalUrl
            );
            setCurrentMapUrl(finalUrl);
          }
        } else {
          console.warn(
            "⚠️ mapPgmUrl이 비어있거나 유효하지 않음. API 응답:",
            mapResponse
          );
          console.warn("기본 이미지 사용:", mapImageUrl);
          setCurrentMapUrl(mapImageUrl);
        }
      } catch (error) {
        console.error("❌ 맵 이미지 가져오기 실패:", error);
        console.warn("기본 이미지 사용:", mapImageUrl);
        // 에러 발생 시에만 기본 이미지 사용
        setCurrentMapUrl(mapImageUrl);
      } finally {
        setIsMapLoading(false);
      }
    };

    fetchMap();
  }, [selectedFloorId, buildingId, mapImageUrl]);

  // 선택된 층의 로봇 목록 가져오기
  useEffect(() => {
    const fetchRobots = async () => {
      if (!selectedFloorId || !buildingId) {
        setDevices([]);
        return;
      }

      try {
        setDevicesLoading(true);
        const robots = await getBuildingFloorRobots(
          buildingId,
          selectedFloorId
        );
        // DeviceDto를 Device 형태로 변환
        const devicesData: Device[] = robots.map((robot) => ({
          id: robot.deviceId,
          name: robot.name,
          type: robot.type === DeviceType.ROBOT ? "robot" : "sensor",
        }));
        setDevices(devicesData);
        console.log("해당 층의 로봇 목록:", devicesData);
      } catch (error) {
        console.error("로봇 목록 가져오기 실패:", error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchRobots();
  }, [selectedFloorId, buildingId]);

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
    return devices.filter((device) => !placedIds.has(device.id));
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

      const device = devices.find((d) => d.id === draggedDeviceId);
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
  const selectedFloor = floors.find((floor) => floor.id === selectedFloorId);
  const selectedFloorName = selectedFloor?.name || floors[0]?.name || "1층";

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
              floors={floors}
              selectedFloorId={selectedFloorId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFloorSelect={setSelectedFloorId}
              onAddFloor={() => {
                navigate("/map/register/section1");
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
            <div ref={mapAreaRef} className={s.mapAreaWrapper}>
              {loading || isMapLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    color: "#8B8B8B",
                  }}
                >
                  로딩 중...
                </div>
              ) : currentMapUrl ? (
                <div className={s.maparea}>
                  <MapArea
                    mapImageUrl={currentMapUrl}
                    zoomLevel={zoomLevel}
                    onZoomLevelChange={setZoomLevel}
                    placedDevices={placedDevices}
                    onDeviceDragStart={handlePlacedDeviceDragStart}
                    mapOffset={mapOffset}
                    onMapOffsetChange={setMapOffset}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    color: "#8B8B8B",
                  }}
                >
                  맵 이미지를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={s.sub_function_footer}>
          <Button
            text="제품 추가하기"
            leftIcon={Plus}
            onClick={() => navigate("/robot/register/section1")}
          />
          <button
            className={s.button_scan}
            onClick={() => {
              navigate(
                `/map/register/section2?floorId=${selectedFloorId || ""}`
              );
            }}
          >
            <Radar size={16} />
            <span className={s.button_scan_text}>공간 다시 스캔하기</span>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
