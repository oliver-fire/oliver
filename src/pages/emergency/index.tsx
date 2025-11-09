import MapViewer from "@/components/page/emergency/map-viewer";
import s from "./styles.module.scss";
import MainLayout from "@/shared/components/main-layout";
import CameraViewer from "@/components/page/emergency/camera-viewer";
import DeviceLog from "@/components/page/emergency/device-log";
import FireDeclaration from "@/components/page/emergency/fire-declaration";

export default function Emergency() {
  return (
    <MainLayout>
      <div className={s.container}>
        <div className={s.main_section}>
          <div className={s.content}>
            <p className={s.description}>현재 상황</p>
            <h1 className={s.title}>초기 진압 시도 중</h1>
          </div>

          <div className={s.map_section}>
            <p className={s.sub_description}>지도</p>
            <MapViewer sensorId="1" />
          </div>

          <div className={s.camera_section}>
            <p className={s.sub_description}>로봇 카메라</p>
            <CameraViewer />
          </div>
        </div>

        <div className={s.sub_section}>
          <div className={s.fire_declaration_section}>
            <FireDeclaration />
          </div>

          <DeviceLog />
        </div>
      </div>
    </MainLayout>
  );
}
