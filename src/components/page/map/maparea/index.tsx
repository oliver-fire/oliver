import { useEffect, useRef, useState } from "react";
import s from "./styles.module.scss";
import DeviceItem from "@/components/page/map/device";

interface PlacedDevice {
  id: string;
  deviceId?: string; // 실제 API 요청에 사용할 deviceId
  name: string;
  type: "robot" | "sensor";
  x: number;
  y: number;
}

interface MapAreaProps {
  mapImageUrl: string;
  zoomLevel: number;
  onZoomLevelChange: (zoomLevel: number) => void;
  placedDevices?: PlacedDevice[];
  onDeviceDragStart?: (deviceId: string, e: React.MouseEvent) => void;
  onDeviceClick?: (deviceId: string) => void;
  onMapOffsetChange?: (offset: { x: number; y: number }) => void;
  mapOffset?: { x: number; y: number };
  showBorder?: boolean;
}

export default function MapArea({
  mapImageUrl,
  zoomLevel,
  onZoomLevelChange,
  placedDevices = [],
  onDeviceDragStart,
  onDeviceClick,
  onMapOffsetChange,
  mapOffset: externalMapOffset,
  showBorder = true,
}: MapAreaProps) {
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [internalMapOffset, setInternalMapOffset] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // externalMapOffset이 제공되면 사용, 아니면 내부 상태 사용
  const mapOffset = externalMapOffset ?? internalMapOffset;
  const setMapOffset = externalMapOffset
    ? (offset: { x: number; y: number }) => {
        onMapOffsetChange?.(offset);
      }
    : setInternalMapOffset;

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

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isMapDragging]);

  const handleMapMouseDown = (e: React.MouseEvent) => {
    // 디바이스나 디바이스 컨테이너가 아닌 경우에만 지도 드래그
    const target = e.target as HTMLElement;
    const isDeviceClick = target.closest("[data-device-item]");
    const isImage = target.tagName === "IMG" || target.closest("img");

    if (!isDeviceClick && (isImage || e.target === e.currentTarget)) {
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
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.min(200, Math.max(50, zoomLevel + delta));
    onZoomLevelChange(newZoom);
  };

  const scale = zoomLevel / 100;

  return (
    <div
      className={`${s.map} ${isMapDragging ? s.dragging : ""} ${
        !showBorder ? s.noBorder : ""
      }`}
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
        {/* 지도 위에 배치된 디바이스들 - 소화로봇 먼저 (낮은 z-index) */}
        {placedDevices
          .filter((device) => device.type === "robot")
          .map((device) => {
            // 겹침 체크
            const isOverlapped = placedDevices.some(
              (d) =>
                d.id !== device.id &&
                d.type === "sensor" &&
                Math.abs(d.x - device.x) < 100 &&
                Math.abs(d.y - device.y) < 100
            );

            return (
              <div
                key={device.id}
                data-device-item="true"
                style={{
                  position: "absolute",
                  left: `${device.x}px`,
                  top: `${device.y}px`,
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                  zIndex: 1,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startPos = { x: e.clientX, y: e.clientY };
                  setDragStartPos(startPos);
                  if (onDeviceDragStart) {
                    onDeviceDragStart(device.id, e);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // 드래그가 아닌 클릭인지 확인 (이동 거리가 작으면 클릭)
                  if (dragStartPos) {
                    const moveDistance = Math.sqrt(
                      Math.pow(e.clientX - dragStartPos.x, 2) +
                      Math.pow(e.clientY - dragStartPos.y, 2)
                    );
                    console.log("🖱️ [MapArea] 디바이스 클릭:", {
                      deviceId: device.deviceId || device.id,
                      moveDistance,
                      isClick: moveDistance < 5,
                    });
                    if (moveDistance < 5 && onDeviceClick) {
                      // deviceId가 있으면 deviceId 사용, 없으면 id 사용
                      const deviceIdToUse = device.deviceId || device.id;
                      console.log("✅ [MapArea] onDeviceClick 호출:", deviceIdToUse);
                      onDeviceClick(deviceIdToUse);
                    }
                  } else if (onDeviceClick) {
                    // dragStartPos가 없어도 클릭 이벤트 처리
                    const deviceIdToUse = device.deviceId || device.id;
                    console.log("✅ [MapArea] onDeviceClick 호출 (dragStartPos 없음):", deviceIdToUse);
                    onDeviceClick(deviceIdToUse);
                  }
                  setDragStartPos(null);
                }}
              >
                <DeviceItem
                  name={device.name}
                  type={device.type}
                  isOverlapped={isOverlapped}
                  draggable={true}
                />
              </div>
            );
          })}
        {/* 화재 감지기 나중에 (높은 z-index, 항상 위에) */}
        {placedDevices
          .filter((device) => device.type === "sensor")
          .map((device) => {
            return (
              <div
                key={device.id}
                data-device-item="true"
                style={{
                  position: "absolute",
                  left: `${device.x}px`,
                  top: `${device.y}px`,
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                  zIndex: 2,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startPos = { x: e.clientX, y: e.clientY };
                  setDragStartPos(startPos);
                  if (onDeviceDragStart) {
                    onDeviceDragStart(device.id, e);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // 드래그가 아닌 클릭인지 확인 (이동 거리가 작으면 클릭)
                  if (dragStartPos) {
                    const moveDistance = Math.sqrt(
                      Math.pow(e.clientX - dragStartPos.x, 2) +
                      Math.pow(e.clientY - dragStartPos.y, 2)
                    );
                    console.log("🖱️ [MapArea] 디바이스 클릭:", {
                      deviceId: device.deviceId || device.id,
                      moveDistance,
                      isClick: moveDistance < 5,
                    });
                    if (moveDistance < 5 && onDeviceClick) {
                      // deviceId가 있으면 deviceId 사용, 없으면 id 사용
                      const deviceIdToUse = device.deviceId || device.id;
                      console.log("✅ [MapArea] onDeviceClick 호출:", deviceIdToUse);
                      onDeviceClick(deviceIdToUse);
                    }
                  } else if (onDeviceClick) {
                    // dragStartPos가 없어도 클릭 이벤트 처리
                    const deviceIdToUse = device.deviceId || device.id;
                    console.log("✅ [MapArea] onDeviceClick 호출 (dragStartPos 없음):", deviceIdToUse);
                    onDeviceClick(deviceIdToUse);
                  }
                  setDragStartPos(null);
                }}
              >
                <DeviceItem
                  name={device.name}
                  type={device.type}
                  isOverlapped={false}
                  draggable={true}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
