import s from "./styles.module.scss";
import { FireExtinguisher, LucideIcon } from "lucide-react";
import d from "../../../../public/sample/fire-robot.svg"

interface ActionHistoryProps {
  statusMain: string;
  statusSub: string;
  robotns: string;
  time: string;
  icon?: LucideIcon | React.ComponentType<any>;
  iconColor?: string;
}

export default function ActionHistory({ statusMain, statusSub, robotns, time, icon: Icon, iconColor = "#000" }: ActionHistoryProps) {
  const IconComponent = Icon || FireExtinguisher;
  
  return (
    <div className={s.container}>


      <div className={s.right}>
           <IconComponent size={35} color={iconColor} />

           <div className={s.robotinfo}>

                <div className={s.robottext}>
                    <span className={s.statusmain}>{statusMain}</span>
                    <span className={s.statussub}>{statusSub}</span>
                </div>

                <div className={s.robotstatus}>
                    <img src={d} alt="fire-robot" className={s.robotimage} color="#8B8B8B"/>
                    <span className={s.robotns}>{robotns}</span>
                </div>

           </div>
      </div>

      
      <div className={s.left}>
        <span className={s.time}>{time}</span>
      </div>
    </div>
  );
}