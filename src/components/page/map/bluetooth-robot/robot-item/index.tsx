import s from "./styles.module.scss";

interface Props {
  battery: string;
  name: string;
  type: string;
}

export default function RobotItem({ battery = "", name, type }: Props) {
  return (
    <div className={s.smallcontainer}>
      <img
        className={s.img}
        src="/sample/oliver.png"
        alt="find-robot"
      ></img>

      <div className={s.content}>
        <h1 className={s.name}>{name}</h1>

        <div className={s.description}>
          <p className={s.type}>
            {type} · 배터리 {battery}%
          </p>
        </div>
      </div>
    </div>
  );
}
