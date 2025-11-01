import { Box, Map, Settings, Video } from "lucide-react";
import { useLocation } from "react-router-dom";

import SidebarItem from "./siderbar-item";
import s from "./style.module.scss";

interface Props {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: Props) {
  const pathname = useLocation().pathname;

  const isActive = (path: string) => pathname.includes(path);

  return (
    <aside className={s.sidebar} data-open={isOpen}>
      <ul className={s.menu}>
        <SidebarItem 
          icon={Box} 
          text="로봇" 
          href="/" 
          isActive={pathname === "/"} 
        />
        <SidebarItem 
          icon={Video} 
          text="카메라" 
          href="/camera" 
          isActive={isActive("/camera")} 
        />
        <SidebarItem 
          icon={Map} 
          text="지도" 
          href="/map" 
          isActive={isActive("/map")} 
        />
        <SidebarItem 
          icon={Settings} 
          text="설정" 
          href="/settings" 
          isActive={isActive("/settings")} 
        />
        <div className={s.full} />
        
      </ul>
    </aside>
  );
}
