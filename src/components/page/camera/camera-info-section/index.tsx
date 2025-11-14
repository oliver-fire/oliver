import { useState } from "react";

import { Segment } from "@/shared/components";

import { CameraSignalStrengthCard } from "@/components";

import s from "./style.module.scss";

export default function CameraInfoSection() {
  const [selectedSegment, setSelectedSegment] = useState("thermal");
  return (
    <section className={s.cameraInfoSection}>
      <div>
        <CameraSignalStrengthCard
          averageDelay={100}
          maxDelay={150}
          medianDelay={120}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        ></div>

        <div className={s.content}>
          <div className={s.header}>
            <a
              href="https://namu.wiki/w/%EC%97%B4%ED%99%94%EC%83%81%EC%B9%B4%EB%A9%94%EB%9D%BC"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NoCameraInfoSection() {
  return (
    <section className={s.noCameraInfoSection}>
      <h1>카메라 정보가 없습니다</h1>
      <div className={s.content}>
        <p>
          현재 화재 감지 센서가 정상 상태이며, 영상 스트림은 비활성화되어
          있습니다.
        </p>
        <p>화재 상황이 발생하면 실시간 영상이 자동으로 표시됩니다.</p>
      </div>
    </section>
  );
}
