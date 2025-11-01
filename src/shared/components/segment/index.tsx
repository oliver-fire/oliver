import cn from "classnames";

import s from "./style.module.scss";

interface SegmentItem {
  label: string;
  value: string;
}

interface Props {
  items: SegmentItem[];
  selected: string;
  onChange: (value: string) => void;
  width?: string | number;
  height?: string | number;
}

export default function Segment({ items, selected, onChange, width, height }: Props) {
  const containerStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
  };

  const itemStyle: React.CSSProperties = {
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div className={s.segment} style={containerStyle}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(s.item, selected === item.value && s.selected)}
          style={itemStyle}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
