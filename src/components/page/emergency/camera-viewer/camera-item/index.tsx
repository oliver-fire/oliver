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
  // Cloudflare Stream iframe URL with autoplay
  const cloudflareStreamUrl =
    "https://customer-ofozypfag8cjmsfq.cloudflarestream.com/55b680c5ee5400f60ea642eddbea475f/iframe?autoplay=true&muted=true";

  return (
    <div className={s.container} onClick={onClick}>
      <div className={s.videoContainer}>
        {imageUrl ? (
          <img className={s.image} src={imageUrl} alt={robotName} />
        ) : (
          <iframe
            className={s.iframe}
            src={cloudflareStreamUrl}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            title={`${robotName} 카메라`}
          />
        )}
      </div>
      <div className={s.robotInfo}>
        <img src="/sample/oliver.png" alt="로봇" className={s.robotIcon} />
        <p className={s.robotName}>{robotName}</p>
      </div>
    </div>
  );
}
