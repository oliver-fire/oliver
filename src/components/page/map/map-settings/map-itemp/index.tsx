import { Layers2, Pencil, Trash2 } from "lucide-react";
import s from "./styles.module.scss";

interface MapItemProps {
  title: string;
  description: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MapItem({
  title,
  description,
  onEdit,
  onDelete,
}: MapItemProps) {
  return (
    <div className={s.container}>
      <div className={s.lead}>
        <div className={s.titleContainer}>
          <Layers2 size={24} />
          <h1 className={s.title}>{title}</h1>
        </div>

        <p className={s.description}>{description}</p>
      </div>

      <div className={s.tail}>
        <button
          className={s.iconButton}
          onClick={onEdit}
          type="button"
          aria-label="수정"
        >
          <Pencil size={24} color="#8B8B8B" />
        </button>
        <button
          className={s.iconButton}
          onClick={onDelete}
          type="button"
          aria-label="삭제"
        >
          <Trash2 size={24} color="#8B8B8B" />
        </button>
      </div>
    </div>
  );
}
