import { ChevronDown, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button, Checkbox, Contact } from "@/shared/components";
import MainLayout from "@/shared/components/main-layout";

import s from "./styles.module.scss";

// 임시 소방서 목데이터
const fireStations = [
  "서울강서소방서",
  "서울강남소방서",
  "서울강북소방서",
  "서울종로소방서",
  "서울마포소방서",
  "서울송파소방서",
  "서울영등포소방서",
];

export default function Settings() {
  const [selectedFireStation, setSelectedFireStation] = useState(
    fireStations[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <MainLayout>
      <div className={s.container}>
        <div className={s.content}>
          <h1 className={s.title}>설정</h1>
          <span className={s.description}>올리버 설정을 할 수 있습니다</span>
        </div>

        <div className={s.fireFunction}>
          <h2 className={s.sub_title}>화재 기능</h2>

          <div className={s.firedeclaration}>
            <Checkbox
              label="자동 AI 119 신고"
              defaultChecked={true}
              onChange={() => {}}
            />
          </div>
          <div className={s.fireStationSelect} ref={dropdownRef}>
            <div
              className={s.selectButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img src="/sample/119.svg" alt="119" className={s.logo} />
              <span className={s.selectedText}>{selectedFireStation}</span>
              <ChevronDown size={24} className={s.chevron} />
            </div>
            {isDropdownOpen && (
              <div className={s.dropdown}>
                {fireStations.map((station) => (
                  <div
                    key={station}
                    className={`${s.dropdownItem} ${
                      station === selectedFireStation ? s.selected : ""
                    }`}
                    onClick={() => {
                      setSelectedFireStation(station);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {station}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={s.contact}>
          <Contact
            title="전화알림"
            firstButtonText="전화를 받겠습니다"
            secondButtonText="안 받을게요"
            icon={Phone}
            placeholder="010-0000-0000"
          />
        </div>
        <Button text="저장" onClick={() => {}} />
      </div>
    </MainLayout>
  );
}
