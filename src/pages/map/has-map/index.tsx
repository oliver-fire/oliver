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
import MapSettings from "@/components/page/map/map-settings";
import RobotDetail from "@/components/page/robot/robot-detail";
import { getBuildingFloors, getAllBuildings } from "@/api/building/service";
import { getBuildingFloorMap } from "@/api/map/service";
import {
  getBuildingFloorRobots,
  getAllDevices,
  getDeviceById,
  updateDevice,
  getDashboardFloorDevices,
} from "@/api/bot/service";
import { DeviceType, DeviceDto } from "@/api/bot/dto/device";

// 화재감지기일 때 name에서 tuya 키 부분 제거하는 헬퍼 함수
const getDisplayName = (rawName: string, deviceType: DeviceType): string => {
  const isSensor = deviceType === DeviceType.SENSOR;
  return isSensor && rawName.includes("-tuya-key-")
    ? rawName.split("-tuya-key-")[0]
    : rawName;
};

// PGM 파일을 PNG로 변환하는 함수
const convertPgmToPng = async (pgmUrl: string): Promise<string> => {
  try {
    console.log("🔄 [hasmap] PGM 파일 다운로드 시작:", pgmUrl);

    // PGM 파일 가져오기
    const response = await fetch(pgmUrl);
    if (!response.ok) {
      throw new Error(`PGM 파일 다운로드 실패: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("✅ [hasmap] PGM 파일 다운로드 완료, 크기:", uint8Array.length);

    // PGM 헤더 파싱
    let offset = 0;
    let header = "";

    // P2 (ASCII) 또는 P5 (Binary) 확인
    while (offset < uint8Array.length && header.length < 10) {
      const char = String.fromCharCode(uint8Array[offset]);
      header += char;
      offset++;
      if (char === "\n" && header.length > 2) break;
    }

    // 헤더에서 매직 넘버 확인
    const magicNumber = header.trim().split(/\s+/)[0];
    const isAscii = magicNumber === "P2";
    const isBinary = magicNumber === "P5";

    if (!isAscii && !isBinary) {
      throw new Error(`지원하지 않는 PGM 형식: ${magicNumber}`);
    }

    console.log(
      "📊 [hasmap] PGM 형식:",
      isAscii ? "ASCII (P2)" : "Binary (P5)"
    );

    // 헤더 파싱 (너비, 높이, 최대값)
    let width = 0;
    let height = 0;
    let maxValue = 255;

    if (isAscii) {
      // ASCII PGM 파싱
      const text = new TextDecoder().decode(uint8Array);
      const lines = text.split("\n");
      let lineIndex = 0;

      // 매직 넘버 건너뛰기
      while (
        lineIndex < lines.length &&
        (lines[lineIndex].trim().startsWith("#") ||
          lines[lineIndex].trim().startsWith("P"))
      ) {
        lineIndex++;
      }

      // 너비, 높이, 최대값 파싱
      const values: number[] = [];
      for (let i = lineIndex; i < lines.length && values.length < 3; i++) {
        const parts = lines[i].trim().split(/\s+/);
        for (const part of parts) {
          if (part && !part.startsWith("#")) {
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
              values.push(num);
            }
          }
        }
      }

      width = values[0] || 0;
      height = values[1] || 0;
      maxValue = values[2] || 255;

      // ASCII 데이터 시작 위치 찾기
      let dataStart = 0;
      let valueCount = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "\n" || text[i] === " ") {
          const num = parseInt(text.substring(dataStart, i).trim(), 10);
          if (!isNaN(num)) {
            valueCount++;
            if (valueCount === 3) {
              offset = i + 1;
              break;
            }
          }
          dataStart = i + 1;
        }
      }
    } else {
      // Binary PGM 파싱
      let headerEnd = 0;
      let newlineCount = 0;

      // 헤더는 보통 3-4줄 (P5, width, height, maxValue)
      for (let i = 0; i < Math.min(1000, uint8Array.length); i++) {
        if (uint8Array[i] === 0x0a) {
          // \n
          newlineCount++;
          if (newlineCount >= 3) {
            headerEnd = i + 1;
            break;
          }
        }
      }

      // 헤더 텍스트 파싱
      const headerText = new TextDecoder().decode(
        uint8Array.slice(0, headerEnd)
      );
      const lines = headerText.split("\n");
      const values: number[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("P")) {
          const parts = trimmed.split(/\s+/);
          for (const part of parts) {
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
              values.push(num);
            }
          }
        }
      }

      width = values[0] || 0;
      height = values[1] || 0;
      maxValue = values[2] || 255;

      offset = headerEnd;
    }

    console.log(
      "📊 [hasmap] PGM 크기:",
      width,
      "x",
      height,
      ", 최대값:",
      maxValue
    );

    if (width === 0 || height === 0) {
      throw new Error("PGM 크기를 파싱할 수 없습니다");
    }

    // Canvas 생성
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas 컨텍스트를 가져올 수 없습니다");
    }

    // ImageData 생성
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // PGM 데이터를 ImageData로 변환
    if (isAscii) {
      // ASCII PGM
      const text = new TextDecoder().decode(uint8Array);
      const textData = text.substring(offset).trim().split(/\s+/);
      for (let i = 0; i < textData.length && i < width * height; i++) {
        const gray = parseInt(textData[i], 10);
        const normalized = Math.floor((gray / maxValue) * 255);
        const index = i * 4;
        data[index] = normalized; // R
        data[index + 1] = normalized; // G
        data[index + 2] = normalized; // B
        data[index + 3] = 255; // A
      }
    } else {
      // Binary PGM
      const pixelCount = width * height;
      const bytesPerPixel = maxValue > 255 ? 2 : 1;

      for (
        let i = 0;
        i < pixelCount && offset + i * bytesPerPixel < uint8Array.length;
        i++
      ) {
        let gray = 0;
        if (bytesPerPixel === 1) {
          gray = uint8Array[offset + i];
        } else {
          gray =
            (uint8Array[offset + i * 2] << 8) | uint8Array[offset + i * 2 + 1];
        }

        const normalized = Math.floor((gray / maxValue) * 255);
        const index = i * 4;
        data[index] = normalized; // R
        data[index + 1] = normalized; // G
        data[index + 2] = normalized; // B
        data[index + 3] = 255; // A
      }
    }

    // Canvas에 그리기
    ctx.putImageData(imageData, 0, 0);

    // PNG로 변환
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG 변환 실패"));
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        console.log("✅ [hasmap] PGM → PNG 변환 완료:", pngUrl);
        resolve(pngUrl);
      }, "image/png");
    });
  } catch (error) {
    console.error("❌ [hasmap] PGM 변환 실패:", error);
    throw error;
  }
};

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
  id: string; // 표시용 ID (robotId)
  deviceId: string; // 실제 API 요청에 사용할 deviceId
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

  // placedDevices 상태 변경 시 로그 출력
  useEffect(() => {
    console.log("🔄 [hasmap] placedDevices 상태 변경:");
    console.log(`  총 ${placedDevices.length}개 디바이스`);
    placedDevices.forEach((device, index) => {
      console.log(
        `  [${index + 1}] ID: ${device.id}, 이름: ${device.name}, 타입: ${device.type}, 위치: (x=${device.x}, y=${device.y})`
      );
    });
  }, [placedDevices]);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [currentMapUrl, setCurrentMapUrl] = useState<string>("");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [buildingId, setBuildingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [allDevicesFromAPI, setAllDevicesFromAPI] = useState<DeviceDto[]>([]);
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);
  const [selectedFloorName, setSelectedFloorName] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);
  const [isDeviceDetailOpen, setIsDeviceDetailOpen] = useState(false);
  const previousBlobUrlRef = useRef<string | null>(null);
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
          setSelectedFloorName(floorsData[0].name);
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
          } else if (finalUrl.startsWith("/")) {
            // 절대 경로인 경우 (예: "/maps/image.pgm")
            finalUrl = `${baseURL}${finalUrl}`;
            console.log(
              "✅ API에서 받은 절대 경로를 baseURL과 조합:",
              finalUrl
            );
          } else {
            // 상대 경로인 경우 (예: "maps/image.pgm")
            finalUrl = `${baseURL}/${finalUrl}`;
            console.log(
              "✅ API에서 받은 상대 경로를 baseURL과 조합:",
              finalUrl
            );
          }

          // PGM 파일인지 확인하고 PNG로 변환
          if (finalUrl.toLowerCase().endsWith(".pgm")) {
            console.log("🔄 [hasmap] PGM 파일 감지, PNG로 변환 시작");
            try {
              // 이전 blob URL 정리
              if (previousBlobUrlRef.current) {
                URL.revokeObjectURL(previousBlobUrlRef.current);
              }

              const pngUrl = await convertPgmToPng(finalUrl);
              previousBlobUrlRef.current = pngUrl;
              setCurrentMapUrl(pngUrl);
            } catch (error) {
              console.error("❌ [hasmap] PGM 변환 실패, 원본 URL 사용:", error);
              // PGM 변환 실패 시 원본 URL 사용 (브라우저가 지원하지 않을 수 있음)
              setCurrentMapUrl(finalUrl);
            }
          } else {
            // PGM이 아니면 그대로 사용
            // 이전 blob URL 정리
            if (previousBlobUrlRef.current) {
              URL.revokeObjectURL(previousBlobUrlRef.current);
              previousBlobUrlRef.current = null;
            }
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

    // 컴포넌트 언마운트 시 blob URL 정리
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
        previousBlobUrlRef.current = null;
      }
    };
  }, [selectedFloorId, buildingId, mapImageUrl]);

  // 선택된 층의 기기 목록 가져오기 (로봇 + 센서)
  useEffect(() => {
    const fetchDevices = async () => {
      if (!selectedFloorId || !buildingId) {
        setDevices([]);
        return;
      }

      // 선택된 층의 이름 가져오기
      const currentFloor = floors.find((f) => f.id === selectedFloorId);
      const currentFloorName = currentFloor?.name || "";

      try {
        setDevicesLoading(true);

        console.log("🔍 [hasmap] 기기 불러오기 시작");
        console.log("📍 [hasmap] buildingId:", buildingId);
        console.log("📍 [hasmap] floorId:", selectedFloorId);
        console.log("📍 [hasmap] floorName:", currentFloorName);

        let allDevices: Device[] = [];
        const placedDevicesFromAPI: PlacedDevice[] = [];

        // 먼저 getAllDevices를 호출해서 deviceId 매핑 정보 가져오기
        let devicesFromAPIForMapping: DeviceDto[] = [];
        try {
          devicesFromAPIForMapping = await getAllDevices();
          setAllDevicesFromAPI(devicesFromAPIForMapping); // 상태에 저장
          console.log(
            "✅ [hasmap] getAllDevices로 전체 디바이스 가져옴:",
            devicesFromAPIForMapping.length
          );

          // 센서 디바이스 확인
          const sensors = devicesFromAPIForMapping.filter(
            (d) => d.type === DeviceType.SENSOR
          );
          console.log(
            `📊 [hasmap] 전체 디바이스 중 센서 수: ${sensors.length}`
          );
          sensors.forEach((sensor, idx) => {
            console.log(
              `  [센서 ${idx + 1}] deviceId: ${sensor.deviceId}, name: "${sensor.name}", floorId: "${sensor.location?.floorId}", floorName: "${sensor.location?.floorName}"`
            );
          });
        } catch (allDevicesError) {
          console.error(
            "❌ [hasmap] getAllDevices 호출 실패:",
            allDevicesError
          );
        }

        // 이름과 타입으로 deviceId를 찾는 헬퍼 함수 (로컬 변수 사용)
        // 센서의 경우 name에 tuya-key가 포함될 수 있으므로 유연하게 매칭
        const findDeviceIdLocal = (
          name: string,
          type: "robot" | "sensor"
        ): string => {
          const deviceType =
            type === "robot" ? DeviceType.ROBOT : DeviceType.SENSOR;

          // 정확한 name 일치로 먼저 찾기
          let found = devicesFromAPIForMapping.find(
            (d: DeviceDto) => d.name === name && d.type === deviceType
          );

          // 센서의 경우 name에 tuya-key가 포함될 수 있으므로 유연하게 매칭
          if (!found && type === "sensor") {
            // name에서 tuya-key 부분 제거한 후 비교
            const nameWithoutTuya = name.includes("-tuya-key-")
              ? name.split("-tuya-key-")[0]
              : name;

            found = devicesFromAPIForMapping.find((d: DeviceDto) => {
              if (d.type !== deviceType) return false;
              const dNameWithoutTuya = d.name.includes("-tuya-key-")
                ? d.name.split("-tuya-key-")[0]
                : d.name;
              return dNameWithoutTuya === nameWithoutTuya || d.name === name;
            });
          }

          if (found) {
            console.log(
              `  🔍 [hasmap] deviceId 찾음: 이름="${name}", 타입="${type}" -> deviceId="${found.deviceId}"`
            );
            return found.deviceId;
          }

          console.warn(
            `  ⚠️ [hasmap] deviceId를 찾을 수 없음: 이름="${name}", 타입="${type}"`
          );
          console.warn(
            `  📋 [hasmap] 매칭 시도한 디바이스 목록:`,
            devicesFromAPIForMapping
              .filter((d) => d.type === deviceType)
              .map((d) => `"${d.name}"`)
          );
          return ""; // deviceId를 찾을 수 없으면 빈 문자열 반환
        };

        // 방법 1: /v1/dashboard/{buildingId}/{floorId}/devices API 사용 (x, y 좌표 포함)
        try {
          const dashboardResponse = await getDashboardFloorDevices(
            buildingId,
            selectedFloorId
          );
          console.log(
            "✅ [hasmap] getDashboardFloorDevices 응답:",
            dashboardResponse
          );
          console.log(
            `📊 [hasmap] 대시보드 API에서 가져온 기기 수: ${dashboardResponse.data.length}`
          );

          // 센서와 로봇 개수 확인 (firesensor도 센서로 카운트)
          const robotCount = dashboardResponse.data.filter(
            (d) => d.type === "robot"
          ).length;
          const sensorCount = dashboardResponse.data.filter(
            (d) => d.type === "sensor" || (d.type as string) === "firesensor"
          ).length;
          console.log(
            `📊 [hasmap] 대시보드 API - 로봇: ${robotCount}개, 센서: ${sensorCount}개`
          );

          dashboardResponse.data.forEach((device, index) => {
            const x = device.location?.x ?? 0;
            const y = device.location?.y ?? 0;

            // API에서 "firesensor"로 오는 경우 "sensor"로 변환
            const deviceTypeStr = device.type as string;
            const normalizedType =
              deviceTypeStr === "firesensor" || deviceTypeStr === "sensor"
                ? "sensor"
                : deviceTypeStr === "robot"
                  ? "robot"
                  : "robot"; // 기본값

            console.log(
              `  [${index + 1}] robotId: ${device.robotId}, 이름: ${device.name}, 타입: ${device.type} -> 정규화: ${normalizedType}`
            );
            console.log(
              `      📍 위치 정보: x=${x}, y=${y}, location 객체:`,
              device.location
            );
            console.log(
              `      ✅ x가 0이 아님: ${x !== 0}, y가 0이 아님: ${y !== 0}`
            );

            // 실제 deviceId 찾기 (정규화된 타입 사용)
            const actualDeviceId = findDeviceIdLocal(
              device.name,
              normalizedType as "robot" | "sensor"
            );
            console.log(
              `      🔑 실제 deviceId: ${actualDeviceId || "(찾을 수 없음)"}`
            );

            // Device 목록에 추가 (정규화된 타입 사용)
            allDevices.push({
              id: device.robotId.toString(),
              name: getDisplayName(
                device.name,
                normalizedType === "robot"
                  ? DeviceType.ROBOT
                  : DeviceType.SENSOR
              ),
              type: normalizedType as "robot" | "sensor",
            });

            // x, y 좌표가 있고 (0, 0)이 아니면 placedDevices에 추가 (정규화된 타입 사용)
            // (0, 0)은 배치되지 않은 것으로 간주하여 "할당 필요 로봇" 섹션에 표시
            if (
              device.location &&
              device.location.x !== undefined &&
              device.location.y !== undefined &&
              !(device.location.x === 0 && device.location.y === 0)
            ) {
              console.log(
                `      ✅ placedDevices에 추가: robotId=${device.robotId}, deviceId=${actualDeviceId}, x=${device.location.x}, y=${device.location.y}`
              );
              placedDevicesFromAPI.push({
                id: device.robotId.toString(),
                deviceId: actualDeviceId || device.robotId.toString(), // deviceId를 찾을 수 없으면 robotId 사용
                name: getDisplayName(
                  device.name,
                  normalizedType === "robot"
                    ? DeviceType.ROBOT
                    : DeviceType.SENSOR
                ),
                type: normalizedType as "robot" | "sensor",
                x: device.location.x,
                y: device.location.y,
              });
            } else {
              console.log(
                `      ⚠️ 위치 정보 없음 또는 (0, 0) - placedDevices에 추가하지 않음 (할당 필요 섹션에 표시됨)`
              );
            }
          });

          console.log(
            `📊 [hasmap] 지도에 배치할 디바이스 수: ${placedDevicesFromAPI.length}`
          );
          placedDevicesFromAPI.forEach((device, index) => {
            console.log(
              `  [${index + 1}] robotId: ${device.id}, deviceId: ${device.deviceId}, 이름: ${device.name}, 타입: ${device.type}, 위치: (x=${device.x}, y=${device.y})`
            );
          });

          // placedDevices 업데이트 (x, y 좌표가 있는 디바이스들)
          if (placedDevicesFromAPI.length > 0) {
            console.log(
              `✅ [hasmap] placedDevices 상태 업데이트: ${placedDevicesFromAPI.length}개 디바이스`
            );
            setPlacedDevices(placedDevicesFromAPI);
          } else {
            console.log(
              `⚠️ [hasmap] 배치할 디바이스가 없습니다. 모든 디바이스의 x, y 좌표가 0이거나 없습니다.`
            );
          }
        } catch (dashboardError) {
          console.error("❌ [hasmap] 대시보드 API 호출 실패:", dashboardError);

          // 대시보드 API 실패 시 기존 방식으로 폴백
          try {
            const robots = await getBuildingFloorRobots(
              buildingId,
              selectedFloorId
            );
            console.log("✅ [hasmap] getBuildingFloorRobots 응답:", robots);
            console.log(
              `📊 [hasmap] 로봇 API에서 가져온 기기 수: ${robots.length}`
            );

            robots.forEach((device, index) => {
              console.log(
                `  [${index + 1}] ID: ${device.deviceId}, 이름: ${device.name}, 타입: ${device.type === DeviceType.ROBOT ? "로봇" : "센서"}`
              );
            });

            // DeviceDto를 Device 형태로 변환 (화재감지기 이름 처리)
            allDevices = robots.map((robot) => ({
              id: robot.deviceId,
              name: getDisplayName(robot.name, robot.type),
              type: robot.type === DeviceType.ROBOT ? "robot" : "sensor",
            }));

            // x, y 좌표가 있으면 placedDevices에 추가
            const placedFromRobots: PlacedDevice[] = robots
              .filter(
                (robot) =>
                  robot.location &&
                  robot.location.x !== undefined &&
                  robot.location.y !== undefined
              )
              .map((robot) => ({
                id: robot.deviceId, // 표시용 ID
                deviceId: robot.deviceId, // 실제 API 요청에 사용할 deviceId
                name: getDisplayName(robot.name, robot.type),
                type: (robot.type === DeviceType.ROBOT ? "robot" : "sensor") as
                  | "robot"
                  | "sensor",
                x: robot.location!.x,
                y: robot.location!.y,
              }));

            if (placedFromRobots.length > 0) {
              setPlacedDevices(placedFromRobots);
            }
          } catch (robotError) {
            console.error("❌ [hasmap] 로봇 API 호출 실패:", robotError);
          }
        }

        // 방법 2: getAllDevices로 모든 디바이스를 가져와서 해당 층 필터링 (센서 포함, 대시보드 API가 실패한 경우만)
        if (allDevices.length === 0) {
          try {
            const allDevicesFromAPI = await getAllDevices();
            console.log("✅ [hasmap] getAllDevices 응답:", allDevicesFromAPI);
            console.log(
              `📊 [hasmap] 전체 디바이스 수: ${allDevicesFromAPI.length}`
            );

            // 해당 층의 디바이스만 필터링
            const floorDevices = allDevicesFromAPI.filter(
              (device) =>
                device.location?.floorId === selectedFloorId ||
                device.location?.floorName === currentFloorName ||
                (device.location?.buildingId === buildingId &&
                  currentFloorName &&
                  device.location?.floorName === currentFloorName)
            );

            console.log(
              `📊 [hasmap] 해당 층(${selectedFloorId}, ${currentFloorName})의 디바이스 수: ${floorDevices.length}`
            );

            // getAllDevices 결과를 사용 (센서 포함, 화재감지기 이름 처리)
            if (floorDevices.length > 0) {
              allDevices = floorDevices.map((device) => ({
                id: device.deviceId,
                name: getDisplayName(device.name, device.type),
                type: device.type === DeviceType.ROBOT ? "robot" : "sensor",
              }));
            }
          } catch (allDevicesError) {
            console.error(
              "❌ [hasmap] getAllDevices 호출 실패:",
              allDevicesError
            );
          }
        }

        console.log("✅ [hasmap] 최종 기기 목록:", allDevices);
        console.log(`📊 [hasmap] 최종 기기 수: ${allDevices.length}`);
        const robotCount = allDevices.filter((d) => d.type === "robot").length;
        const sensorCount = allDevices.filter(
          (d) => d.type === "sensor"
        ).length;
        console.log(
          `📊 [hasmap] 로봇: ${robotCount}개, 센서: ${sensorCount}개`
        );

        setDevices(allDevices);
      } catch (error) {
        console.error("❌ [hasmap] 기기 목록 가져오기 실패:", error);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchDevices();
  }, [selectedFloorId, buildingId, floors, selectedFloorName]);

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

  // 디바이스 클릭 핸들러
  const handleDeviceClick = async (deviceId: string) => {
    try {
      const deviceData = await getDeviceById(deviceId);
      setSelectedDevice(deviceData);
      setIsDeviceDetailOpen(true);
    } catch (error) {
      console.error("디바이스 정보 가져오기 실패:", error);
    }
  };

  // 디바이스 디테일 닫기
  const handleCloseDeviceDetail = () => {
    setIsDeviceDetailOpen(false);
    setSelectedDevice(null);
  };

  // 디바이스 업데이트 후 새로고침
  const handleDeviceUpdate = () => {
    // 디바이스 목록 새로고침을 위해 selectedFloorId나 buildingId 변경 트리거
    // useEffect가 자동으로 다시 실행됨
    setDevices([...devices]);
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

  // 이름과 타입으로 deviceId를 찾는 헬퍼 함수 (컴포넌트 레벨)
  const findDeviceId = (name: string, type: "robot" | "sensor"): string => {
    const deviceType = type === "robot" ? DeviceType.ROBOT : DeviceType.SENSOR;
    const found = allDevicesFromAPI.find(
      (d) => d.name === name && d.type === deviceType
    );
    if (found) {
      return found.deviceId;
    }
    return ""; // deviceId를 찾을 수 없으면 빈 문자열 반환
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

          console.log(`🖱️ [hasmap] 드래그 중 위치 계산:`);
          console.log(`  마우스 위치: (${e.clientX}, ${e.clientY})`);
          console.log(`  지도 영역: left=${mapInnerLeft}, top=${mapInnerTop}`);
          console.log(`  상대 좌표: (${relativeX}, ${relativeY})`);
          console.log(`  mapOffset: (${mapOffset.x}, ${mapOffset.y})`);
          console.log(`  scale: ${scale}`);
          console.log(`  최종 지도 좌표: x=${x.toFixed(2)}, y=${y.toFixed(2)}`);

          // 이미 배치된 디바이스인지 확인
          const existingIndex = placedDevices.findIndex(
            (d) => d.id === draggedDeviceId
          );

          if (existingIndex >= 0) {
            // 위치 업데이트
            console.log(
              `  ✅ 기존 디바이스 위치 업데이트: ${draggedDeviceId} -> (${x.toFixed(2)}, ${y.toFixed(2)})`
            );
            setPlacedDevices((prev) =>
              prev.map((d, idx) => (idx === existingIndex ? { ...d, x, y } : d))
            );
          } else {
            // 새로 배치
            console.log(
              `  ✅ 새 디바이스 배치: ${device.id} -> (${x.toFixed(2)}, ${y.toFixed(2)})`
            );
            // deviceId 찾기 (컴포넌트 레벨의 findDeviceId 사용)
            const actualDeviceId = findDeviceId(device.name, device.type);
            console.log(
              `  🔑 새 디바이스 deviceId: ${actualDeviceId || device.id}`
            );
            setPlacedDevices((prev) => [
              ...prev,
              {
                id: device.id,
                deviceId: actualDeviceId || device.id, // deviceId를 찾을 수 없으면 id 사용
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

    const handleMouseUp = async () => {
      if (isDraggingDevice && draggedDeviceId) {
        // 드롭 시 현재 위치의 디바이스 찾기
        const placedDevice = placedDevices.find(
          (d) => d.id === draggedDeviceId
        );
        if (placedDevice) {
          console.log("📍 [hasmap] 디바이스 위치 저장:");
          console.log(`  디바이스 ID: ${placedDevice.id}`);
          console.log(`  이름: ${placedDevice.name}`);
          console.log(`  타입: ${placedDevice.type}`);
          console.log(`  X 좌표: ${placedDevice.x}`);
          console.log(`  Y 좌표: ${placedDevice.y}`);
          console.log(`  층 ID: ${selectedFloorId}`);
          console.log(`  건물 ID: ${buildingId}`);
          console.log(
            `  📤 전송할 데이터: { location: { buildingId: "${buildingId}", floorId: "${selectedFloorId}", x: ${placedDevice.x}, y: ${placedDevice.y} } }`
          );

          // 서버에 위치 저장 (x, y만 전송) - 실제 deviceId 사용
          const deviceIdToUse = placedDevice.deviceId || placedDevice.id;
          console.log(
            `  🔑 [hasmap] 사용할 deviceId: ${deviceIdToUse} (placedDevice.deviceId: ${placedDevice.deviceId}, placedDevice.id: ${placedDevice.id})`
          );
          try {
            await updateDevice(deviceIdToUse, {
              location: {
                buildingId: buildingId,
                floorId: selectedFloorId,
                x: placedDevice.x,
                y: placedDevice.y,
              },
            });
            console.log("✅ [hasmap] 디바이스 위치 서버에 저장 완료");
          } catch (error) {
            console.error("❌ [hasmap] 디바이스 위치 저장 실패:", error);
            console.error(`  실패한 deviceId: ${deviceIdToUse}`);
          }
        } else {
          console.warn(
            `⚠️ [hasmap] 드롭한 디바이스(${draggedDeviceId})를 placedDevices에서 찾을 수 없습니다.`
          );
          console.log("현재 placedDevices:", placedDevices);
        }
      }
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
  }, [
    isDraggingDevice,
    draggedDeviceId,
    zoomLevel,
    mapOffset,
    placedDevices,
    selectedFloorId,
    buildingId,
    devices,
    allDevicesFromAPI,
  ]);

  // 선택된 floor의 이름 가져오기 (렌더링용)
  const selectedFloor = floors.find((floor) => floor.id === selectedFloorId);
  const displayFloorName =
    selectedFloor?.name || selectedFloorName || floors[0]?.name || "1층";

  return (
    <MainLayout backgroundVariant="gray">
      <div className={s.container}>
        <div className={s.sub_function_header}>
          <Filter FloorName={displayFloorName} onToggle={setIsFilterOpen} />
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
              onFloorSelect={(floorId) => {
                setSelectedFloorId(floorId);
                const floor = floors.find((f) => f.id === floorId);
                if (floor) {
                  setSelectedFloorName(floor.name);
                }
              }}
              onAddFloor={() => {
                navigate("/map/register/section1");
              }}
              onManage={() => {
                setIsMapSettingsOpen(true);
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
                    onDeviceClick={handleDeviceClick}
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
      {isMapSettingsOpen && (
        <MapSettings onClose={() => setIsMapSettingsOpen(false)} />
      )}

      {isDeviceDetailOpen && selectedDevice && (
        <div className={s.detailOverlay} onClick={handleCloseDeviceDetail}>
          <div className={s.detailModal} onClick={(e) => e.stopPropagation()}>
            <RobotDetail
              deviceId={selectedDevice.deviceId}
              onClose={handleCloseDeviceDetail}
              onUpdate={handleDeviceUpdate}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
