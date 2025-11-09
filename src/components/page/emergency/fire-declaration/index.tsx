import { Bot } from "lucide-react";
import s from "./styles.module.scss";

export default function FireDeclaration() {
  const time = "22";

  return (
    <div className={s.container}>
      <div className={s.header}>
        <img src="/sample/119.svg" alt="fire-declaration" className={s.icon} />

        <div className={s.info}>
          <Bot size={16} className={s.botIcon} />
          <p className={s.botName}>올리버 AI</p>
        </div>
      </div>

      <div className={s.content}>
        <p className={s.title}>관할 소방서로 자동 신고됨</p>
        <p className={s.description}>
          실시간 로봇 영상 정보가 소방서로 전송됩니다.
        </p>
      </div>

      <div className={s.footer}>
        <div className={s.time_header}>
          <p className={s.time_title}>통화 기록</p>
          <p className={s.time_value}>{time}초</p>
        </div>
        <audio className={s.audio} controls>
          <source src="" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}
