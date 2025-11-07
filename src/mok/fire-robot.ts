export type RobotStatus = "대기중" | "충전중" | "이동중" | "진화중" | "";

export interface FireRobot {
  id: string;
  name: string;
  model: string;
  status: RobotStatus;
  battery: number;
  location: string;
  lastUpdate: string;
}

export const fireRobots: FireRobot[] = [
  {
    id: "robot-001",
    name: "현관용 소화 로봇",
    model: "소화 로봇",
    status: "대기중",
    battery: 32,
    location: "미술관 2층",
    lastUpdate: "2025년 7월 15일 13시 32분",
  },
  {
    id: "robot-002",
    name: "현관용 소화 로봇",
    model: "소화 로봇",
    status: "충전중",
    battery: 32,
    location: "미술관 2층",
    lastUpdate: "2025년 7월 15일 13시 32분",
  },
  {
    id: "robot-003",
    name: "현관용 소화 로봇",
    model: "소화 로봇",
    status: "이동중",
    battery: 32,
    location: "미술관 2층",
    lastUpdate: "2025년 7월 15일 13시 32분",
  },
  {
    id: "robot-004",
    name: "현관용 소화 로봇",
    model: "소화 로봇",
    status: "진화중",
    battery: 32,
    location: "미술관 2층",
    lastUpdate: "2025년 7월 15일 13시 32분",
  },
  {
    id: "robot-005",
    name: "복도용 소화 로봇",
    model: "소화 로봇",
    status: "대기중",
    battery: 85,
    location: "미술관 1층",
    lastUpdate: "2025년 7월 15일 14시 10분",
  },
  {
    id: "robot-006",
    name: "전시실 소화 로봇",
    model: "소화 로봇",
    status: "충전중",
    battery: 95,
    location: "미술관 3층",
    lastUpdate: "2025년 7월 15일 14시 05분",
  },
  {
    id: "robot-007",
    name: "신규 소화 로봇",
    model: "소화 로봇",
    status: "",
    battery: 0,
    location: "",
    lastUpdate: "2025년 7월 20일 10시 00분",
  },
  {
    id: "robot-008",
    name: "테스트 소화 로봇",
    model: "소화 로봇",
    status: "",
    battery: 50,
    location: "",
    lastUpdate: "2025년 7월 20일 10시 00분",
  },
];
