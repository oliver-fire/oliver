import { MainLayout } from "@/shared/components";
import { CameraInfoSection, VideoSection } from "@/components/page/camera";

export default function HasCamera() {
  return (
    <MainLayout row>
      <CameraInfoSection />
      <VideoSection />
    </MainLayout>
  );
}
