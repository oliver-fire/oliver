export type SensorStatus = "정상" | "점검필요" | "고장" | "";

export interface FireSensor {
  id: string;
  name: string;
  model: string;
  status: SensorStatus;
  battery: number;
  location: string;
  lastUpdate: string;
}

export const fireSensors: FireSensor[] = [
  {
    id: "sensor-001",
    name: "현관 화재 감지기",
    model: "화재 감지기",
    status: "정상",
    battery: 95,
    location: "미술관 2층",
    lastUpdate: "2025년 7월 15일 13시 32분",
  },
  {
    id: "sensor-002",
    name: "복도 화재 감지기",
    model: "화재 감지기",
    status: "점검필요",
    battery: 45,
    location: "미술관 1층",
    lastUpdate: "2025년 7월 15일 14시 10분",
  },
  {
    id: "sensor-003",
    name: "전시실 화재 감지기",
    model: "화재 감지기",
    status: "고장",
    battery: 15,
    location: "미술관 3층",
    lastUpdate: "2025년 7월 15일 12시 05분",
  },
  {
    id: "sensor-004",
    name: "로비 화재 감지기",
    model: "화재 감지기",
    status: "정상",
    battery: 88,
    location: "미술관 1층",
    lastUpdate: "2025년 7월 15일 13시 45분",
  },
  {
    id: "sensor-005",
    name: "신규 화재 감지기",
    model: "화재 감지기",
    status: "",
    battery: 0,
    location: "",
    lastUpdate: "2025년 7월 22일 09시 30분",
  },
  {
    id: "sensor-006",
    name: "테스트 화재 감지기",
    model: "화재 감지기",
    status: "",
    battery: 60,
    location: "",
    lastUpdate: "2025년 7월 22일 09시 30분",
  },
];
