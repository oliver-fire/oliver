import { getAllBuildings } from "../building/service";
import apiClient from "../client";

import {
  DeleteDeviceResponseDto,
  DeviceDto,
  DeviceType,
  RegisterRobotDto,
  RegisterSensorDto,
  UpdateDeviceDto,
  UpdateDeviceResponseDto,
} from "./dto/device";

// API 응답 래퍼 타입
interface ApiResponse<T> {
  status: number;
  message: string;
  responseAt: string;
  data: T;
}

// Dashboard 디바이스 응답 타입
interface DashboardDeviceResponse {
  deviceId: string;
  deviceName: string;
  deviceStatus: string;
  deviceType: "robot" | "sensor";
  batteryLevel: number;
  createdAt: string;
  floorName: string;
}

/**
 * 모든 디바이스 조회
 */
export const getAllDevices = async (): Promise<DeviceDto[]> => {
  const buildingsResponse = await getAllBuildings();
  const devices = await Promise.all(
    buildingsResponse.data.map(async (building) => {
      const response = await apiClient.get<
        ApiResponse<DashboardDeviceResponse[]>
      >(`/v1/dashboard/${building.id}/devices`);

      // DashboardDeviceResponse를 DeviceDto로 변환
      return response.data.data.map((device) => ({
        deviceId: device.deviceId,
        type:
          device.deviceType === "robot" ? DeviceType.ROBOT : DeviceType.SENSOR,
        name: device.deviceName,
        status: device.deviceStatus,
        location: {
          buildingId: building.id,
          buildingName: building.name,
          floorId: "",
          floorName: device.floorName,
          x: 0,
          y: 0,
        },
        batteryLevel: device.batteryLevel,
        communicationStatus: 0,
        uptimeSeconds: 0,
        createdAt: device.createdAt,
      }));
    })
  );
  return devices.flat();
};

/**
 * 디바이스 ID로 조회
 */
export const getDeviceById = async (deviceId: string): Promise<DeviceDto> => {
  const response = await apiClient.get<ApiResponse<DeviceDto>>(
    `/v1/device/${deviceId}`
  );
  return response.data.data;
};

/**
 * 디바이스 타입별 조회
 */
export const getDevicesByType = async (
  type: "robot" | "sensor"
): Promise<DeviceDto[]> => {
  const response = await apiClient.get<ApiResponse<DeviceDto[]>>(
    `/v1/device?type=${type}`
  );
  return response.data.data;
};

// 층별 로봇 응답 타입
interface BuildingFloorRobotResponse {
  robotId?: number;
  deviceId?: string;
  name: string;
  type: "robot" | "sensor";
  status: string;
  location?: {
    x: number;
    y: number;
  };
}

/**
 * 특정 건물의 특정 층에 있는 로봇 조회
 */
export const getBuildingFloorRobots = async (
  buildingId: string,
  floorId: string
): Promise<DeviceDto[]> => {
  const response = await apiClient.get<
    ApiResponse<BuildingFloorRobotResponse[]>
  >(`/v1/building/${buildingId}/${floorId}/robots`);

  console.log(`[getBuildingFloorRobots] 응답:`, response.data);
  console.log(`[getBuildingFloorRobots] 데이터:`, response.data.data);

  // BuildingFloorRobotResponse를 DeviceDto로 변환
  return response.data.data.map((robot) => {
    console.log(`[getBuildingFloorRobots] 로봇 데이터:`, robot);
    return {
      deviceId: robot.robotId?.toString() || robot.deviceId || "",
      type: robot.type === "robot" ? DeviceType.ROBOT : DeviceType.SENSOR,
      name: robot.name || "",
      status: robot.status || "",
      location: {
        buildingId: buildingId,
        buildingName: "",
        floorId: floorId,
        floorName: "",
        x: robot.location?.x || 0,
        y: robot.location?.y || 0,
      },
      batteryLevel: 0,
      communicationStatus: 0,
      uptimeSeconds: 0,
      createdAt: "",
    };
  });
};

/**
 * 디바이스 업데이트
 */
export const updateDevice = async (
  deviceId: string,
  data: UpdateDeviceDto
): Promise<UpdateDeviceResponseDto> => {
  const response = await apiClient.patch<UpdateDeviceResponseDto>(
    `/devices/${deviceId}`,
    data
  );
  return response.data;
};

/**
 * 디바이스 삭제
 */
export const deleteDevice = async (
  deviceId: string
): Promise<DeleteDeviceResponseDto> => {
  const response = await apiClient.delete<DeleteDeviceResponseDto>(
    `/devices/${deviceId}`
  );
  return response.data;
};

/**
 * 디바이스 로그 조회
 */
export interface DeviceLogResponse {
  status: number;
  message: string;
  responseAt: string;
  data: {
    logId: string;
    timestamp: string;
    title: string;
    message: string;
    level: string;
    icon: string;
  }[];
}

export const getDeviceLogs = async (
  deviceId: string
): Promise<DeviceLogResponse> => {
  const response = await apiClient.get<DeviceLogResponse>(
    `/v1/device/${deviceId}/logs`
  );
  return response.data;
};

/**
 * 로봇 등록
 * @param data - 로봇 등록에 필요한 정보 (id, buildingId, floorId, name)
 * @returns 등록된 디바이스 정보
 */
export const registerRobot = async (
  data: RegisterRobotDto
): Promise<DeviceDto> => {
  const response = await apiClient.post<ApiResponse<DeviceDto>>(
    "/v1/device/register/robot",
    data
  );
  return response.data.data;
};

/**
 * UUID 생성 함수
 */
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 공통 목데이터 이름 목록
 */
export const mockDeviceNames = [
  "FireBot Alpha",
  "RescueBot Beta",
  "SafetyBot Gamma",
  "GuardBot Delta",
  "AlertBot Echo",
  "ProtectBot Foxtrot",
  "DefenseBot Golf",
  "ShieldBot Hotel",
  "WatchBot India",
  "SecureBot Juliet",
  "GuardianBot Kilo",
  "DefenderBot Lima",
  "SentinelBot Mike",
  "PatrolBot November",
  "VigilBot Oscar",
  "MonitorBot Papa",
  "ScoutBot Quebec",
  "SurveyBot Romeo",
  "InspectBot Sierra",
  "CheckBot Tango",
  "ScanBot Uniform",
  "DetectBot Victor",
  "TrackBot Whiskey",
  "SearchBot Xray",
  "FindBot Yankee",
  "LocateBot Zulu",
  "ExploreBot Alpha-2",
  "InvestigateBot Beta-2",
  "AnalyzeBot Gamma-2",
  "ExamineBot Delta-2",
  "ReviewBot Echo-2",
  "AuditBot Foxtrot-2",
  "VerifyBot Golf-2",
  "ConfirmBot Hotel-2",
  "ValidateBot India-2",
  "TestBot Juliet-2",
  "CheckBot Kilo-2",
  "InspectBot Lima-2",
  "MonitorBot Mike-2",
  "WatchBot November-2",
  "GuardBot Oscar-2",
  "ProtectBot Papa-2",
  "DefendBot Quebec-2",
  "ShieldBot Romeo-2",
  "SecureBot Sierra-2",
  "SafeBot Tango-2",
  "GuardBot Uniform-2",
  "DefenseBot Victor-2",
  "AlertBot Whiskey-2",
  "WarningBot Xray-2",
];

/**
 * 목데이터 50개 생성 (UUID id와 다양한 이름) - 로봇/센서 공통 사용
 */
const generateMockDevices = () => {
  const devices = [];
  for (let i = 0; i < 50; i++) {
    const id = generateUUID();
    const name =
      mockDeviceNames[i] || `Device-${String(i + 1).padStart(3, "0")}`;
    devices.push({ id, name });
  }
  return devices;
};

/**
 * 순차적으로 로봇 등록 (이미 등록된 ID는 건너뛰기)
 * @returns 등록된 로봇 정보 배열
 */
export const registerRobotsSequentially = async (): Promise<DeviceDto[]> => {
  // 빌딩 정보 가져오기
  const buildingsResponse = await getAllBuildings();
  if (buildingsResponse.data.length === 0) {
    throw new Error("등록된 빌딩이 없습니다.");
  }

  // 첫 번째 빌딩 사용
  const buildingId = buildingsResponse.data[0].id;

  // 이미 등록된 디바이스 목록 가져오기
  const existingDevices = await getAllDevices();
  const existingDeviceIds = new Set(
    existingDevices.map((device) => device.deviceId)
  );

  // 목데이터 생성
  const mockRobots = generateMockDevices();

  // 등록된 로봇 정보 저장
  const registeredRobots: DeviceDto[] = [];

  // 순차적으로 등록 시도
  for (const robot of mockRobots) {
    // 이미 등록된 ID면 건너뛰기
    if (existingDeviceIds.has(robot.id)) {
      console.log(`로봇 ${robot.id}는 이미 등록되어 있습니다. 건너뜁니다.`);
      continue;
    }

    try {
      const registerData: RegisterRobotDto = {
        id: robot.id,
        buildingId: buildingId,
        floorId: "", // 공백 문자열
        name: robot.name,
      };

      const registeredRobot = await registerRobot(registerData);
      registeredRobots.push(registeredRobot);
      console.log(`로봇 ${robot.name} (${robot.id}) 등록 완료`);

      // 등록된 ID를 Set에 추가하여 중복 체크
      existingDeviceIds.add(robot.id);
    } catch (error: any) {
      console.error(
        `로봇 ${robot.name} (${robot.id}) 등록 실패:`,
        error.message
      );
      // 에러가 발생해도 다음 로봇 등록 시도
      continue;
    }
  }

  return registeredRobots;
};

/**
 * 센서 등록
 * @param data - 센서 등록에 필요한 정보 (id, buildingId, floorId, name, tuyaDeviceRegisterKey)
 * @returns 등록된 디바이스 정보
 */
export const registerSensor = async (
  data: RegisterSensorDto
): Promise<DeviceDto> => {
  const response = await apiClient.post<ApiResponse<DeviceDto>>(
    "/v1/device/register/sensor",
    data
  );
  return response.data.data;
};

/**
 * 순차적으로 센서 등록 (이미 등록된 ID는 건너뛰기)
 * @returns 등록된 센서 정보 배열
 */
export const registerSensorsSequentially = async (): Promise<DeviceDto[]> => {
  // 빌딩 정보 가져오기
  const buildingsResponse = await getAllBuildings();
  if (buildingsResponse.data.length === 0) {
    throw new Error("등록된 빌딩이 없습니다.");
  }

  // 첫 번째 빌딩 사용
  const buildingId = buildingsResponse.data[0].id;

  // 이미 등록된 디바이스 목록 가져오기
  const existingDevices = await getAllDevices();
  const existingDeviceIds = new Set(
    existingDevices.map((device) => device.deviceId)
  );

  // 목데이터 생성 (로봇과 동일한 목데이터 사용)
  const mockDevices = generateMockDevices();

  // 등록된 센서 정보 저장
  const registeredSensors: DeviceDto[] = [];

  // 순차적으로 등록 시도
  for (const device of mockDevices) {
    // 이미 등록된 ID면 건너뛰기
    if (existingDeviceIds.has(device.id)) {
      console.log(`센서 ${device.id}는 이미 등록되어 있습니다. 건너뜁니다.`);
      continue;
    }

    try {
      const registerData: RegisterSensorDto = {
        id: device.id,
        buildingId: buildingId,
        floorId: "", // 공백 문자열
        name: device.name,
        tuyaDeviceRegisterKey: "tuya-key-12345", // 고정 키 값
      };

      const registeredSensor = await registerSensor(registerData);
      registeredSensors.push(registeredSensor);
      console.log(`센서 ${device.name} (${device.id}) 등록 완료`);

      // 등록된 ID를 Set에 추가하여 중복 체크
      existingDeviceIds.add(device.id);
    } catch (error: any) {
      console.error(
        `센서 ${device.name} (${device.id}) 등록 실패:`,
        error.message
      );
      // 에러가 발생해도 다음 센서 등록 시도
      continue;
    }
  }

  return registeredSensors;
};
