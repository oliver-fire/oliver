export enum DeviceType {
  ROBOT = "robot",
  SENSOR = "sensor",
}

export enum RobotStatus {
  IDLE = "idle",
  MOVING = "moving",
  CHARGING = "charging",
  ERROR = "error",
  PAUSED = "paused",
  EVOLVING = "evolving",
  OFFLINE = "offline",
}

export enum SensorStatus {
  NORMAL = "normal",
  WARNING = "warning",
  ALARM = "alarm",
  OFFLINE = "offline",
  ERROR = "error",
}

export interface DeviceLocationDto {
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  x: number;
  y: number;
}

export interface DeviceDto {
  deviceId: string;
  type: DeviceType;
  name: string;
  status: string;
  location: DeviceLocationDto;
  batteryLevel: number;
  communicationStatus: number;
  uptimeSeconds: number;
  createdAt: string;
}

export interface UpdateDeviceLocationDto {
  buildingId: string;
  floorId: string;
  x: number;
  y: number;
}

export interface UpdateDeviceDto {
  name?: string;
  location?: UpdateDeviceLocationDto;
}

export interface UpdateDeviceResponseDto {
  status: string;
  message: string;
}

export interface DeleteDeviceResponseDto {
  status: string;
  message: string;
}
