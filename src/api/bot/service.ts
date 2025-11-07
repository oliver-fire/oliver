import apiClient from "../client";

import {
  DeleteDeviceResponseDto,
  DeviceDto,
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

/**
 * 모든 디바이스 조회
 */
export const getAllDevices = async (): Promise<DeviceDto[]> => {
  const response = await apiClient.get<ApiResponse<DeviceDto[]>>("/v1/device");
  return response.data.data;
};

/**
 * 디바이스 ID로 조회
 */
export const getDeviceById = async (deviceId: string): Promise<DeviceDto> => {
  const response = await apiClient.get<ApiResponse<DeviceDto>>(
    `/v1/device/${deviceId}`,
  );
  return response.data.data;
};

/**
 * 디바이스 타입별 조회
 */
export const getDevicesByType = async (
  type: "robot" | "sensor",
): Promise<DeviceDto[]> => {
  const response = await apiClient.get<ApiResponse<DeviceDto[]>>(
    `/v1/device?type=${type}`,
  );
  return response.data.data;
};

/**
 * 디바이스 업데이트
 */
export const updateDevice = async (
  deviceId: string,
  data: UpdateDeviceDto,
): Promise<UpdateDeviceResponseDto> => {
  const response = await apiClient.patch<UpdateDeviceResponseDto>(
    `/devices/${deviceId}`,
    data,
  );
  return response.data;
};

/**
 * 디바이스 삭제
 */
export const deleteDevice = async (
  deviceId: string,
): Promise<DeleteDeviceResponseDto> => {
  const response = await apiClient.delete<DeleteDeviceResponseDto>(
    `/devices/${deviceId}`,
  );
  return response.data;
};

// 로봇/센서 등록 요청 DTO
export interface RegisterDeviceDto {
  id: string;
  buildingId: string;
  floorId: string;
  name: string;
  tuyaDeviceRegisterKey?: string;
}

// ID 예시 리스트
const ID_EXAMPLES = [
  "f3a2b1c4-d5e6-49f7-8a0b-1c2d3e4f5a6b",
  "9d8e7f6a-5b4c-43d2-8a1b-2c3d4e5f6a7b",
  "a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c",
  "3c2b1a4f-5e6d-48c9-8b7a-9d0e1f2a3b4c",
  "4e5f6a7b-8c9d-40a1-9b2c-3d4e5f6a7b8c",
  "b2c3d4e5-f6a7-48b9-8c0d-1e2f3a4b5c6d",
  "8a9b0c1d-2e3f-4a5b-9c6d-7e8f9a0b1c2d",
  "c1d2e3f4-a5b6-47c8-9d0e-1f2a3b4c5d6e",
  "d9e8f7a6-b5c4-49d3-9a2b-3c4d5e6f7a8b",
  "5f4e3d2c-1b0a-45c9-8d7e-6f5a4b3c2d1e",
  "7e6f5a4b-3c2d-41e0-9f1a-2b3c4d5e6f7a",
  "f1e2d3c4-b5a6-49f8-8c9d-0a1b2c3d4e5f",
  "0a1b2c3d-4e5f-40a6-9b7c-8d9e0f1a2b3c",
];

// 랜덤 ID 선택 함수
const getRandomId = (): string => {
  const randomIndex = Math.floor(Math.random() * ID_EXAMPLES.length);
  return ID_EXAMPLES[randomIndex];
};

// 고정 buildingId와 floorId
const FIXED_BUILDING_ID = "6c33d97d-49c6-4b83-95c8-9aadde2dc8db";
const FIXED_FLOOR_ID = "8b151b5c-65bf-46f4-8f69-f47f0a67812f";

/**
 * 로봇 등록
 */
export const registerRobot = async (
  name: string = "김똥개로봇",
): Promise<DeviceDto> => {
  const data: RegisterDeviceDto = {
    id: getRandomId(),
    buildingId: FIXED_BUILDING_ID,
    floorId: FIXED_FLOOR_ID,
    name: name,
  };
  const response = await apiClient.post<ApiResponse<DeviceDto>>(
    "/v1/device/register/robot",
    data,
  );
  return response.data.data;
};

/**
 * 센서 등록
 */
export const registerSensor = async (
  name: string = "김똥개로봇",
): Promise<DeviceDto> => {
  const data: RegisterDeviceDto = {
    id: getRandomId(),
    buildingId: FIXED_BUILDING_ID,
    floorId: FIXED_FLOOR_ID,
    name: name,
    tuyaDeviceRegisterKey: "tuya-key-12345",
  };
  const response = await apiClient.post<ApiResponse<DeviceDto>>(
    "/v1/device/register/sensor",
    data,
  );
  return response.data.data;
};
