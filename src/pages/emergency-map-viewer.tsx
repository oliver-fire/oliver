import { useEffect, useRef } from "react";

import s from "./styles.module.scss";

interface Props {
  zoomLevel: number;
  mapOffset?: { x: number; y: number };
  children?: React.ReactNode;
  onMapScaleChange?: (scale: number) => void;
}

export default function EmergencyMapViewer({
  zoomLevel,
  mapOffset = { x: 0, y: 0 },
  children,
  onMapScaleChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // PGM 파일 로드
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      console.log("이미지 로드됨:", img.width, "x", img.height);

      // 고정 크기로 설정
      const baseWidth = 1200;
      const baseHeight = 600;

      // 줌 레벨에 따라 크기 조정
      const scale = zoomLevel / 100;
      const width = baseWidth * scale;
      const height = baseHeight * scale;

      canvas.width = width;
      canvas.height = height;

      // 캔버스에 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // 스케일 변경 알림
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
    <div className={s.emergencyMapContainer}>
      <canvas
        ref={canvasRef}
        className={s.emergencyMapCanvas}
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
        }}
      />
      <div
        style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
