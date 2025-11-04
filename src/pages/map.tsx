import MainLayout from "@/shared/components/main-layout";
import { useState, useEffect } from "react";
import { MapSection, NoMapSection } from "@/modules/camera/components/only-page";
import { hasBuildings } from "@/mok";

export default function Map() {
  const [isMap, setIsMap] = useState(false);
  const [buildSection, setBuildSection] = useState(0);
  
  useEffect(() => {
    if (hasBuildings()) {
      setBuildSection(3);
    }
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

