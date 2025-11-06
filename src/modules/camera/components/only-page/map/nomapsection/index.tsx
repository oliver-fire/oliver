import Button from "@/shared/components/butoon";
import { Plus } from "lucide-react";
import MakeBuild from "../widgets/make-buiild/section-1";
import MakeBuildSection2 from "../widgets/make-buiild/section-2";
import MakeBuildSection3 from "../widgets/make-buiild/section-3";
import s from "./styles.module.scss";

interface Building {
  id: string;
  name: string;
}

interface Floor {
  id: string;
  level: number;
  name: string;
}

interface Props {
  section: number;
  setSection: (section: number) => void;
  buildings: Building[];
  floors: Floor[];
  maxFloorLevel: number;
  onFetchFloors: (buildingId: string) => Promise<void>;
  onAddFloor: (buildingId: string, floorName: string) => Promise<void>;
}

export default function NoMapSection({ 
  section, 
  setSection, 
  buildings, 
  floors, 
  maxFloorLevel, 
  onFetchFloors, 
  onAddFloor 
}: Props) {
  const handleStartScan = () => {
    setTimeout(() => {
      setSection(3);
    }, 3000);
  };

  return (
    <>
      {section === 0 && (
        <div className={s.noMapSection}>
          <div className={s.content}>
            <h1 className={s.title}>건물이 추가되지 않았습니다</h1>
            <p className={s.description}>
              현재 관리 중인 건물이 없습니다.
              <br />
              건물을 추가하면 로봇의 작동 상태와 경로를 모니터링할 수 있습니다.
            </p>
            <Button 
              text="건물 추가하기" 
              leftIcon={Plus} 
              onClick={() => setSection(1)} 
            />
          </div>
        </div>
      )}
      
      {section === 1 && (
        <MakeBuild 
          isOpen={true} 
          onClose={() => setSection(0)}
          onNext={() => setSection(2)}
        />
      )}

      {section === 2 && (
        <MakeBuildSection2 
          onStartScan={handleStartScan}
        />
      )}

      {section === 3 && (
        <MakeBuildSection3 
          onComplete={() => {
            console.log("스캔 완료");
          }}
          onAddSpace={() => setSection(1)}
          buildings={buildings}
          floors={floors}
          maxFloorLevel={maxFloorLevel}
          onFetchFloors={onFetchFloors}
          onAddFloor={onAddFloor}
        />
      )}
    </>
  );
}