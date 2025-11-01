import { useLocation } from "react-router-dom";
import s from "./styles.module.scss";

const routeNames: Record<string, string> = {
  "/": "Robot",
  "/camera": "Camera",
  "/map": "Map",
  "/settings": "Settings",
};

export default function SubHeader() {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentPage = routeNames[currentPath] || "Dashboard";

  return (
    <div className={s.subHeader}>
      <div className={s.breadcrumb}>
        <span className={s.parent}>Dashboard</span>
        <span className={s.separator}> &gt; </span>
        <span className={s.current}>{currentPage}</span>
      </div>
    </div>
  );
}

