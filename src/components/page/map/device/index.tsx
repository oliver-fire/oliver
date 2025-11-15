import s from "./styles.module.scss";

interface DeviceItemProps {
  name: string;
  type: "sensor" | "robot";
  isOverlapped?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  style?: React.CSSProperties;
}

export default function DeviceItem({
  name,
  type,
  isOverlapped,
  onDragStart,
  draggable = true,
  style,
}: DeviceItemProps) {
  return (
    <div
      data-device-container="true"
      className={`${s.container} ${type === "sensor" ? s.sensor : s.robot} ${
        isOverlapped && type === "robot" ? s.overlapped : ""
      }`}
      style={{
        cursor: draggable ? "grab" : "default",
        ...style,
      }}
      onMouseDown={draggable ? onDragStart : undefined}
    >
      <img
        src={type === "sensor" ? "/sample/sensor.jpg" : "/sample/oliver.png"}
        alt={name}
        className={s.image}
      />
      <p className={s.name}>{name}</p>
    </div>
  );
}
