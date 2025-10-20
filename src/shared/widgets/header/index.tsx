import { Headset, Settings } from "lucide-react";

import { IconButton } from "@/shared/components";

import s from "./style.module.scss";

interface Props {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export default function Header({ leftContent, rightContent }: Props) {
  return (
    <header className={s.header}>
      <div className={s.actions}>
        <img src="/sample/logo.svg" alt="Oliver Logo" className={s.logo} />
        {leftContent}
      </div>
      <div className={s.actions}>
        {rightContent}
        <IconButton icon={Headset} primary={false} onClick={() => {}} />
        <IconButton icon={Settings} primary={false} onClick={() => {}} />
        <img
          src="/sample/profile.png"
          alt="Oliver Profile"
          className={s.avatar}
        />
      </div>
    </header>
  );
}
