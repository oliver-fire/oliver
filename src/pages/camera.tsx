import { useState } from "react";

import { CameraInfoSection, VideoSection } from "@/modules/camera/widgets";
import { NoCameraInfoSection } from "@/modules/camera/widgets/camera-info-section";
import MainLayout from "@/shared/components/main-layout";

export default function Camera() {
  const [isCameraInfo] = useState(true);
  return (
    <MainLayout row>
      {isCameraInfo ? (
        <>
          <CameraInfoSection />
          <VideoSection />
        </>
      ) : (
        <NoCameraInfoSection />
      )}
    </MainLayout>
  );
}
