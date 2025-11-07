import s from "./styles.module.scss";

interface Props {
  name: string;
  x?: number;
  y?: number;
  scale?: number;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  isOverlapped?: boolean;
}

export default function SmallFireSensor({
  name,
  x = 0,
  y = 0,
  scale = 1,
  onMouseDown,
  onDoubleClick,
}: Props) {
  return (
    <div
      className={s.sensorCard}
      data-robot="true"
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 2,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div className={s.sensorImageContainer}>
        <img
          src="/sample/fire-robot.svg"
          alt="화재 감지기"
          className={s.sensorImage}
        />
      </div>
      <div className={s.sensorName}>{name}</div>
    </div>
  );
}
