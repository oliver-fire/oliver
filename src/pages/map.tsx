import MainLayout from "@/shared/components/main-layout";
import { useState, useEffect } from "react";
import { MapSection, NoMapSection } from "@/modules/camera/components/only-page";
// TODO: API에서 건물 데이터 가져오기
// import { getAllBuildings } from "@/api";

export default function Map() {
  const [isMap, setIsMap] = useState(false);
  const [buildSection, setBuildSection] = useState(0);
  
  useEffect(() => {
    // TODO: API에서 건물 데이터 확인
    // const buildings = await getAllBuildings();
    // if (buildings.length > 0) {
    //   setBuildSection(3);
    // }
  }, []);
  
  return (
    <MainLayout backgroundVariant={buildSection === 3 ? "gray" : "default"}>
      {isMap ? (
        <MapSection  />
      ) : (
        <NoMapSection section={buildSection} setSection={setBuildSection} />
      )}
    </MainLayout>
  );
}

