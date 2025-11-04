import { useState } from "react";
import { Header, Sidebar } from "@/shared/widgets";
import { SubHeader } from "@/shared/components";
import s from "./style.module.scss";

interface Props {
  children: React.ReactNode;
  row?: boolean;
  backgroundVariant?: "default" | "gray";
  hideSubHeader?: boolean;
  hideOverflow?: boolean;
}

export default function MainLayout({ children, row = false, backgroundVariant = "default", hideSubHeader = false, hideOverflow = false }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={s.layout}>
      <Header onMenuClick={toggleSidebar} />
      {!hideSubHeader && <SubHeader />}
      <div className={s.container}>
        <main className={`${s.main} ${row ? s.row : ""} ${backgroundVariant === "gray" ? s.grayBackground : ""} ${hideOverflow ? s.noOverflow : ""}`}>{children}</main>
        {isSidebarOpen && (
          <div className={s.overlay} onClick={toggleSidebar} />
        )}
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
}
