import MainLayout from "@/shared/components/main-layout";
import { useState, useEffect } from "react";
import { MapSection, NoMapSection } from "@/modules/camera/components/only-page";
import { getAllBuildings, getBuildingFloors, createBuildingFloor } from "@/api/building/service";

interface Building {
  id: string;
  name: string;
}

interface Floor {
  id: string;
  level: number;
  name: string;
}

export default function Map() {
  const [isMap] = useState(false);
  const [buildSection, setBuildSection] = useState(0);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [maxFloorLevel, setMaxFloorLevel] = useState<number>(0);
  
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await getAllBuildings();
        console.log("=== Building API Response ===");
        console.log("Full response:", response);
        console.log("Buildings data:", response.data);
        
        setBuildings(response.data);
        
        if (response.data.length > 0 && response.data[0].id) {
          const firstBuilding = response.data[0];
          console.log("Building ID found:", firstBuilding.id);
          console.log("Moving to section 3");
          setBuildSection(3);
          await fetchFloors(firstBuilding.id);
        }
      } catch (error) {
        console.error("Failed to fetch buildings:", error);
      }
    };
    
    fetchBuildings();
  }, []);

  const fetchFloors = async (buildingId: string) => {
    try {
      const response = await getBuildingFloors(buildingId);
      console.log("=== Floor API Response ===");
      console.log("Full response:", response);
      console.log("Floors data:", response.data);
      
      setFloors(response.data);
      
      if (response.data.length > 0) {
        const maxLevel = Math.max(...response.data.map(floor => floor.level));
        setMaxFloorLevel(maxLevel);
        console.log("Max floor level:", maxLevel);
      } else {
        setMaxFloorLevel(0);
      }
    } catch (error) {
      console.error("Failed to fetch floors:", error);
    }
  };

  const addFloor = async (buildingId: string, floorName: string) => {
    try {
      const newLevel = maxFloorLevel + 1;
      console.log("=== Creating Floor ===");
      console.log("Building ID:", buildingId);
      console.log("Level:", newLevel);
      console.log("Name:", floorName);
      
      const response = await createBuildingFloor(buildingId, {
        level: newLevel,
        name: floorName,
      });
      
      console.log("=== Floor Created ===");
      console.log("Response:", response);
      
      await fetchFloors(buildingId);
    } catch (error) {
      console.error("Failed to create floor:", error);
      throw error;
    }
  };
  
  return (
    <MainLayout backgroundVariant={buildSection === 3 ? "gray" : "default"}>
      {isMap ? (
        <MapSection  />
      ) : (
        <NoMapSection 
          section={buildSection} 
          setSection={setBuildSection}
          buildings={buildings}
          floors={floors}
          maxFloorLevel={maxFloorLevel}
          onFetchFloors={fetchFloors}
          onAddFloor={addFloor}
        />
      )}
    </MainLayout>
  );
}

