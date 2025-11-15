import { X } from "lucide-react";

import s from "./styles.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoInfo?: {
    status?: string; // "현재 연결 중" | "화재 진압 중"
    robotName?: string; // "소방 로봇 1호" | "소화 로봇 1호"
    battery?: number; // 배터리 퍼센트
    usage?: number; // 사용량 퍼센트
  };
}

export default function VideoDetail({ isOpen, onClose, videoInfo }: Props) {
  if (!isOpen) return null;

  const {
    status = "현재 연결 중",
    robotName = "소방 로봇 1호",
    battery,
    usage,
  } = videoInfo || {};

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.videoContainer}>
          <iframe
            className={s.video}
            src="https://customer-ofozypfag8cjmsfq.cloudflarestream.com/55b680c5ee5400f60ea642eddbea475f/iframe?autoplay=true&muted=true"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            title={`${robotName} 카메라`}
          />
        </div>

        <div className={s.bottomBar}>
          <div className={s.leftSection}>
            <img src="/sample/oliver.png" alt="로봇" className={s.robotIcon} />
            <div className={s.textGroup}>
              <div className={s.mainText}>로봇 카메라 상세</div>
              <div className={s.subText}>{status}</div>
            </div>
          </div>

          <div className={s.centerSection}>
            <img
              src="/sample/oliver.png"
              alt="소방 로봇"
              className={s.robotIcon}
            />
            <div className={s.textGroup}>
              <div className={s.mainText}>{robotName}</div>
              <div className={s.subText}>
                {battery !== undefined && `배터리 ${battery}%`}
                {usage !== undefined && `사용량 ${usage}%`}
              </div>
            </div>
          </div>

          <button className={s.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
