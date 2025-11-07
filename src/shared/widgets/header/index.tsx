import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { IconButton } from "@/shared/components";

import s from "./style.module.scss";

interface Props {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onMenuClick?: () => void;
}

export default function Header({
  leftContent,
  rightContent,
  onMenuClick,
}: Props) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/login");
  };

  return (
    <header className={s.header}>
      <div className={s.actions}>
        <IconButton
          icon={Menu}
          primary={false}
          onClick={onMenuClick || (() => {})}
        />
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
          onClick={handleProfileClick}
        />
      </div>
    </header>
  );
}
