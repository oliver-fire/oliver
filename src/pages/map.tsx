import MainLayout from "@/shared/components/main-layout";
import { useState } from "react";
import { MapSection, NoMapSection } from "@/modules/camera/components/only-page";

export default function Map() {
  const [isMap, setIsMap] = useState(false);
  return (
    <MainLayout>
      {isMap ? (
        <MapSection  />
      ) : (
        <NoMapSection />
      )}
    </MainLayout>
  );
}

