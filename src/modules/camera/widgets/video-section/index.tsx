import { useState } from "react";
import { RealtimeVideo } from "../../components";
import { VideoDetail } from "../../components/only-page";

import s from "./style.module.scss";

export default function VideoSection() {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const handleVideoClick = (index: number) => {
    setSelectedVideo(index);
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  // 임시 비디오 정보 데이터
  const videoInfos = [
    { status: "화재 진압 중", robotName: "소화 로봇 1호", usage: 52 },
    { status: "현재 연결 중", robotName: "소방 로봇 1호", battery: 83 },
    { status: "현재 연결 중", robotName: "소방 로봇 2호", battery: 67 },
    { status: "현재 연결 중", robotName: "소방 로봇 3호", battery: 92 },
    { status: "현재 연결 중", robotName: "소방 로봇 4호", battery: 45 },
  ];

  return (
    <>
      <section className={s.videoSection}>
        <div onClick={() => handleVideoClick(0)} style={{ cursor: "pointer" }}>
          <RealtimeVideo />
        </div>
        <div onClick={() => handleVideoClick(1)} style={{ cursor: "pointer" }}>
          <RealtimeVideo />
        </div>
        <div onClick={() => handleVideoClick(2)} style={{ cursor: "pointer" }}>
          <RealtimeVideo />
        </div>
        <div onClick={() => handleVideoClick(3)} style={{ cursor: "pointer" }}>
          <RealtimeVideo />
        </div>
        <div onClick={() => handleVideoClick(4)} style={{ cursor: "pointer" }}>
          <RealtimeVideo />
        </div>
      </section>
      
      {selectedVideo !== null && (
        <VideoDetail
          isOpen={true}
          onClose={handleClose}
          videoInfo={videoInfos[selectedVideo]}
        />
      )}
    </>
  );
}
