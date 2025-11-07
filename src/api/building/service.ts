import apiClient from "../client";

import {
  BuildingDto,
  BuildingResponseDto,
  CreateBuildingDto,
  CreateFloorDto,
  FloorDto,
  UpdateBuildingDto,
  UpdateFloorDto,
} from "./dto/building";

export interface BuildingListResponse {
  status: number;
  message: string;
  responseAt: string;
  data: {
    id: string;
    name: string;
  }[];
}

export interface FloorListResponse {
  status: number;
  message: string;
  responseAt: string;
  data: {
    id: string;
    level: number;
    name: string;
  }[];
}

export interface CreateFloorRequest {
  level: number;
  name: string;
}

export interface CreateFloorResponse {
  status: number;
  message: string;
  responseAt: string;
  data: {
    id: string;
    level: number;
    name: string;
  };
}

export const getAllBuildings = async (): Promise<BuildingListResponse> => {
  const response = await apiClient.get<BuildingListResponse>("/v1/building");
  return response.data;
};

export const getBuildingFloors = async (
  buildingId: string,
): Promise<FloorListResponse> => {
  const response = await apiClient.get<FloorListResponse>(
    `/v1/building/${buildingId}/floors`,
  );
  return response.data;
};

export const createBuildingFloor = async (
  buildingId: string,
  data: CreateFloorRequest,
): Promise<CreateFloorResponse> => {
  const response = await apiClient.post<CreateFloorResponse>(
    `/v1/building/${buildingId}/floor`,
    data,
  );
  return response.data;
};

/**
 * 건물 ID로 조회
 */
export const getBuildingById = async (
  buildingId: string,
): Promise<BuildingDto> => {
  const response = await apiClient.get<BuildingDto>(`/buildings/${buildingId}`);
  return response.data;
};

/**
 * 건물 생성
 */
export const createBuilding = async (
  data: CreateBuildingDto,
): Promise<BuildingResponseDto> => {
  const response = await apiClient.post<BuildingResponseDto>(
    "/buildings",
    data,
  );
  return response.data;
};

/**
 * 건물 업데이트
 */
export const updateBuilding = async (
  buildingId: string,
  data: UpdateBuildingDto,
): Promise<BuildingResponseDto> => {
  const response = await apiClient.patch<BuildingResponseDto>(
    `/buildings/${buildingId}`,
    data,
  );
  return response.data;
};

/**
 * 건물 삭제
 */
export const deleteBuilding = async (
  buildingId: string,
): Promise<BuildingResponseDto> => {
  const response = await apiClient.delete<BuildingResponseDto>(
    `/buildings/${buildingId}`,
  );
  return response.data;
};

/**
 * 층 생성
 */
export const createFloor = async (data: CreateFloorDto): Promise<FloorDto> => {
  const response = await apiClient.post<FloorDto>(
    `/buildings/${data.buildingId}/floors`,
    data,
  );
  return response.data;
};

/**
 * 층 업데이트
 */
export const updateFloor = async (
  buildingId: string,
  floorId: string,
  data: UpdateFloorDto,
): Promise<FloorDto> => {
  const response = await apiClient.patch<FloorDto>(
    `/buildings/${buildingId}/floors/${floorId}`,
    data,
  );
  return response.data;
};

/**
 * 층 삭제
 */
export const deleteFloor = async (
  buildingId: string,
  floorId: string,
): Promise<BuildingResponseDto> => {
  const response = await apiClient.delete<BuildingResponseDto>(
    `/buildings/${buildingId}/floors/${floorId}`,
  );
  return response.data;
};
