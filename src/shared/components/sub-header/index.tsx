import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import s from "./styles.module.scss";

const routeNames: Record<string, string> = {
  "/": "Robot",
  "/camera": "Camera",
  "/map": "Map",
  "/settings": "Settings",
  "/emergency": "Emergency",
};

export default function SubHeader() {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentPageName = routeNames[currentPath] || "Page";

  return (
    <div className={s.subHeader}>
      <div className={s.breadcrumb}>
        <span className={s.parent}>Dashboard</span>
        <ChevronRight className={s.separator} size={18} />
        <span className={s.current}>{currentPageName}</span>
      </div>
    </div>
  );
}

