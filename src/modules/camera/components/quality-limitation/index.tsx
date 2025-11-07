import { Card } from "@/shared/components";

import QualityLimitBox from "../quality-limit-box";

import s from "./style.module.scss";

export default function CameraQualityLimitationCard() {
  return (
    <Card>
      <Card.Title>성능 제한</Card.Title>
      <div className={s.content}>
        <QualityLimitBox />
      </div>
      <p>
        고성능 모드를 선택하면 처리 지연이 발생할 수 있습니다. 화면이 끊기거나
        렉이 발생할 경우 낮은 성능 옵션을 선택하세요.
      </p>
    </Card>
  );
}
