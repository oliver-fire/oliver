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

export default function SmallFireRobot({
  name,
  x = 0,
  y = 0,
  scale = 1,
  onMouseDown,
  onDoubleClick,
  isOverlapped,
}: Props) {
  return (
    <div
      className={`${s.robotCard} ${isOverlapped ? s.overlapped : ""}`}
      data-robot="true"
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div className={s.robotImageContainer}>
        <img
          src="/sample/fire-robot.svg"
          alt="소화 로봇"
          className={s.robotImage}
        />
      </div>
      <div className={s.robotName}>{name}</div>
    </div>
  );
}
