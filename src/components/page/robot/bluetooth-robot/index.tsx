import s from "./stlyes.module.scss";

interface Props {
  serialNumber: string;
  name: string;
}

export default function BluetoothRobot({ serialNumber = "", name }: Props) {
  return (
    <div className={s.container}>
      <div className={s.smallcontainer}>
        <img
          className={s.image}
          src="/sample/oliver.png"
          alt="find-robot"
        ></img>

        <div className={s.content}>
          <h1 className={s.name}>{name}</h1>

          <div className={s.description}>
            <p className={s.sn}>S/N</p>
            <p className={s.serialNumber}>{serialNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
