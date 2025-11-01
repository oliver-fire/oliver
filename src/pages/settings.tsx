import { useState } from "react";
import { Button, Checkbox, Contact } from "@/shared/components";
import MainLayout from "@/shared/components/main-layout";
import { Phone, ChevronDown } from "lucide-react";
import s from "./settings.module.scss";

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
  const [selectedFireStation, setSelectedFireStation] = useState(fireStations[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "48px"}}>
      <div>
        <span style={{ fontSize: "24px", fontWeight: "500"}}>설정</span><br/>
        <span style={{ color: "#8B8B8B" }}>올리버 설정을 할 수 있습니다</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" , width: "416px", height: "fit-content"}}> 
        <span style={{ fontSize: "20px", fontWeight: "500" }}>화재 기능</span>
        <Checkbox label="자동 AI 119 신고" defaultChecked={true} onChange={() => {}} />
        
        <div className={s.fireStationSelect}>
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
                  className={`${s.dropdownItem} ${selectedFireStation === station ? s.selected : ""}`}
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
        
        <Contact
          title="전화알림"
          firstButtonText="전화를 받겠습니다"
          secondButtonText="전화를 받지 않겠습니다"
          icon={Phone}
          placeholder="010-0000-0000"
        /> 
      </div>

      <Button text="저장"  onClick={() => {}} width={70} height={48} />
      </div>
    </MainLayout>
  );
}

