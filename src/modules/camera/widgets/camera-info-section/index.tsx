import { useState } from "react";

import { Segment } from "@/shared/components";

import { CameraSignalStrengthCard } from "../../components";

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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1 className={s.title}>열화상 카메라</h1>
          <p>
            열화상 카메라는 적외선을 감지해 물체의 온도를 시각적으로 표시하는
            카메라입니다.
            <br />
            즉, 사람이 눈으로 볼 수 없는 열 정보를 영상으로 변환하여, 온도가
            높은 부분은 밝게, 낮은 부분은 어둡게 표현합니다.
          </p>
        </div>

        <Segment
          items={[
            { label: "열화상 카메라", value: "thermal" },
            { label: "카메라", value: "camera" },
          ]}
          selected={selectedSegment}
          onChange={setSelectedSegment}
        />

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
