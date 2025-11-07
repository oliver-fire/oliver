import { Bot, FireExtinguisher, Flame, Minus, Move, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ActionHistory from "@/shared/components/action-history";
import MainLayout from "@/shared/components/main-layout";

import EmergencyMapViewer from "./emergency-map-viewer";

import s from "./styles.module.scss";

export default function Emergency() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMapDragging) {
        setMapOffset({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsMapDragging(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isMapDragging]);

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsMapDragging(true);
    const startPos = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
    dragStartRef.current = startPos;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.min(200, Math.max(50, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoomLevel + 10);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoomLevel - 10);
    setZoomLevel(newZoom);
  };
  return (
    <MainLayout hideSubHeader hideOverflow>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "40px",
          width: "100%",
          maxWidth: "1920px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            flex: "1",
            minWidth: 0,
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <span
              style={{
                color: "#8B8B8B",
                fontFamily: "Pretendard",
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              현재 상황
            </span>
            <span
              style={{
                color: "#000",
                fontFamily: "Pretendard",
                fontSize: "36px",
                fontWeight: 700,
                lineHeight: "normal",
              }}
            >
              초기 진압 시도중
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <span
              style={{ color: "#000", fontSize: "20px", fontWeight: "600" }}
            >
              지도
            </span>
            <div
              className={s.mapWrapper}
              onMouseDown={handleMapMouseDown}
              onWheel={handleWheel}
            >
              <div className={s.zoomControls}>
                <button className={s.zoomButton} onClick={handleZoomOut}>
                  <Minus size={18} />
                </button>
                <div className={s.zoomDisplay}>{zoomLevel}%</div>
                <button className={s.zoomButton} onClick={handleZoomIn}>
                  <Plus size={18} />
                </button>
              </div>
              <EmergencyMapViewer zoomLevel={zoomLevel} mapOffset={mapOffset} />
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <span
              style={{ color: "#000", fontSize: "20px", fontWeight: "600" }}
            >
              로봇 카메라
            </span>
            <div className={s.cameraContainer}>
              <div className={s.cameraVideo}>
                <div className={s.videoFrame}>
                  <video className={s.video} autoPlay muted loop>
                    <source src="/sample/neo.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className={s.cameraName}>
                  <img
                    src="/sample/fire-robot.svg"
                    alt="로봇"
                    className={s.robotIcon}
                  />
                  <span>RX-780</span>
                </div>
              </div>
              <div className={s.cameraVideo}>
                <div className={s.videoFrame}>
                  <video className={s.video} autoPlay muted loop>
                    <source src="/sample/neo.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className={s.cameraName}>
                  <img
                    src="/sample/fire-robot.svg"
                    alt="로봇"
                    className={s.robotIcon}
                  />
                  <span>RX-780</span>
                </div>
              </div>
              <div className={s.cameraVideo}>
                <div className={s.videoFrame}>
                  <video className={s.video} autoPlay muted loop>
                    <source src="/sample/neo.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className={s.cameraName}>
                  <img
                    src="/sample/fire-robot.svg"
                    alt="로봇"
                    className={s.robotIcon}
                  />
                  <span>RX-780</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            width: "500px",
            flexShrink: 0,
            alignItems: "flex-end",
          }}
        >
          <div className={s.autoReportSection}>
            <div className={s.autoReportHeader}>
              <img src="/sample/119.svg" alt="119" className={s.fireLogo} />
              <div className={s.autoReportTitle}>
                <Bot size={16} className={s.botIcon} />
                <span>올리버 AI</span>
              </div>
            </div>
            <div className={s.autoReportMain}>
              <h3 className={s.reportMainText}>관할 소방서로 자동 신고됨</h3>
              <p className={s.reportSubText}>
                실시간 로봇 영상 정보가 소방서로 전송됩니다.
              </p>
            </div>

            <div className={s.callRecordSection}>
              <div className={s.callRecordHeader}>
                <span>통화 기록</span>
                <span>22초</span>
              </div>
              <audio controls className={s.audioPlayer}>
                <source src="" type="audio/mpeg" />
              </audio>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
            }}
          >
            <span
              style={{ color: "#000", fontSize: "20px", fontWeight: "600" }}
            >
              로봇 동작 기록
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0px",
                border: "1px solid #EAEAEA",
                borderRadius: "12px",
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <ActionHistory
                statusMain="화재 상황 종료"
                statusSub="로봇의 배터리가 부족하여 충전 시작함 ㅅㄱ"
                robotns="RX-780"
                time="14:32"
                icon={FireExtinguisher}
                iconColor="#8B8B8B"
              />
              <ActionHistory
                statusMain="위치 변경"
                statusSub={`RX-780, RX-282 로봇을 "노무현지식재산센터"로 이동합니다`}
                robotns="RX-780"
                time="14:30"
                icon={Move}
                iconColor="#8B8B8B"
              />
              <ActionHistory
                statusMain="추가 화재 발견"
                statusSub="노무현지식재산센터에서 화재를 발견하였습니다"
                robotns="RX-780"
                time="14:28"
                icon={Flame}
                iconColor="#FF0000"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
