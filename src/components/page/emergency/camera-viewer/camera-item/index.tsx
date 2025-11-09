import s from "./styles.module.scss";

interface CameraItemProps {
  robotName: string;
  videoUrl?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export default function CameraItem({
  robotName,
  videoUrl,
  imageUrl,
  onClick,
}: CameraItemProps) {
  return (
    <div className={s.container} onClick={onClick}>
      <div className={s.videoContainer}>
        {videoUrl ? (
          <video
            className={s.video}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : imageUrl ? (
          <img className={s.image} src={imageUrl} alt={robotName} />
        ) : (
          <video
            className={s.video}
            src="/sample/neo.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </div>
      <div className={s.robotInfo}>
        <img src="/sample/fire-robot.svg" alt="로봇" className={s.robotIcon} />
        <p className={s.robotName}>{robotName}</p>
      </div>
    </div>
  );
}
