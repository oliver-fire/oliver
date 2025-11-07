export interface Building {
  id: string;
  name: string;
  address: string;
  floors: string[];
  createdAt: string;
}

export const buildings: Building[] = [
  {
    id: "building-001",
    name: "토론 하숙집",
    address: "서울특별시 강남구 테헤란로 123",
    floors: ["토론 하숙집 1F", "토론 하숙집 2F", "토론 하숙집 B1"],
    createdAt: "2025년 1월 1일",
  },
];

export function getAllBuildings(): Building[] {
  return buildings;
}

export function getBuildingById(id: string): Building | undefined {
  return buildings.find((building) => building.id === id);
}

export function addBuilding(building: Building): void {
  buildings.push(building);
}

export function updateBuilding(building: Building): void {
  const index = buildings.findIndex((b) => b.id === building.id);
  if (index !== -1) {
    buildings[index] = building;
  }
}

export function hasBuildings(): boolean {
  return buildings.length > 0;
}
