import {  Menu, Bell } from "lucide-react";
import { IconButton } from "@/shared/components";

import s from "./style.module.scss";

interface Props {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onMenuClick?: () => void;
}

export default function Header({ leftContent, rightContent, onMenuClick }: Props) {
  return (
    <header className={s.header}>
      <div className={s.actions}>
        <IconButton icon={Menu} primary={false} onClick={onMenuClick || (() => {})} />
        <span className={s.title}>Oliver Dashboard</span>
        {leftContent}
      </div>
      <div className={s.actions}>
        {rightContent}

          <IconButton icon={Bell} primary={false} onClick={() => {}} />
          
        <img
          src="/sample/profile.png"
          alt="Oliver Profile"
          className={s.avatar}
        />
      </div>
    </header>
  );
}
