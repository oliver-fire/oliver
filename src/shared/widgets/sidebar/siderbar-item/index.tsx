import { LucideIcon } from "lucide-react";
import s from "./styles.module.scss";

interface Props {
  icon: LucideIcon;
  text: string;
  href: string;
  isActive: boolean;
}

export default function SidebarItem({ icon: Icon, text, href, isActive }: Props) {
  return (
    <li className={s.item} data-active={isActive}>
      <a href={href} className={s.link}>
        <Icon className={s.icon} />
        <span className={s.text}>{text}</span>
      </a>
    </li>
  );
}
