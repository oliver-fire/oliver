import s from "./styles.module.scss";

interface LogItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  robotName: string;
}

export default function LogItem({
  icon,
  title,
  description,
  time,
  robotName,
}: LogItemProps) {
  return (
    <div className={s.container}>
      <div className={s.left}>
        <div className={s.icon}>{icon}</div>
        <div className={s.info}>
          <div className={s.content}>
            <p className={s.title}>{title}</p>
            <p className={s.description}>{description}</p>
          </div>

          <div className={s.ns}>
            <img
              src="/sample/oliver.png"
              alt="fire-robot"
              className={s.robotImage}
            />
            <p className={s.robotName}>{robotName}</p>
          </div>
        </div>
      </div>
      <div className={s.right}>
        <p className={s.time}>{time}</p>
      </div>
    </div>
  );
}
