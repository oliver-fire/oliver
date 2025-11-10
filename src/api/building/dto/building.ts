export interface BuildingDto {
  buildingId: string;
  name: string;
  address: string;
  floors: FloorDto[];
  createdAt: string;
}

export interface FloorDto {
  floorId: string;
  name: string;
  mapUrl?: string;
  createdAt: string;
}

export interface CreateBuildingDto {
  name: string;
  address: string;
}

export interface UpdateBuildingDto {
  name?: string;
  address?: string;
}

export interface CreateFloorDto {
  buildingId: string;
  name: string;
  mapUrl?: string;
}

export interface UpdateFloorDto {
  name?: string;
  mapUrl?: string;
}

export interface BuildingResponseDto {
  status: string;
  message: string;
  data?: BuildingDto;
}










