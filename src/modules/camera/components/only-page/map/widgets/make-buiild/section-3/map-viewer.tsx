import { useEffect, useRef } from "react";
import s from "./styles.module.scss";

interface Props {
  zoomLevel: number;
  mapOffset?: { x: number; y: number };
  children?: React.ReactNode;
  onMapScaleChange?: (scale: number) => void;
}

export default function MapViewer({ zoomLevel, mapOffset = { x: 0, y: 0 }, children, onMapScaleChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      console.log("이미지 로드됨:", img.width, "x", img.height);
      
      const baseWidth = 1200;
      const baseHeight = 600;
      
      const scale = zoomLevel / 100;
      const width = baseWidth * scale;
      const height = baseHeight * scale;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      
      if (onMapScaleChange) {
        onMapScaleChange(scale);
      }
    };
    
    img.onerror = () => {
      console.error("이미지 로드 실패");
    };

    img.src = "/sample/mpas/my_map.png";
  }, [zoomLevel, onMapScaleChange]);

  return (
    <div className={s.mapContainer}>
      <canvas 
        ref={canvasRef} 
        className={s.mapCanvas}
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
        }}
      />
      <div style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}>
        {children}
      </div>
    </div>
  );
}

