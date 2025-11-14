import { useState, useEffect } from "react";
import { X } from "lucide-react";
import s from "./styles.module.scss";
import MapItem from "./map-itemp";
import {
  getBuildingFloors,
  updateBuildingFloor,
  deleteBuildingFloor,
} from "@/api/building/service";
import Input from "@/shared/components/input";
import Button from "@/shared/components/butoon";

interface MapSettingsProps {
  onClose?: () => void;
}

interface Floor {
  id: string;
  name: string;
  level: number;
  address?: string;
}

export default function MapSettings({ onClose }: MapSettingsProps) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const floorsResponse = await getBuildingFloors();
      const floorsData = floorsResponse.data.map((floor) => ({
        id: floor.id,
        name: floor.name,
        level: floor.level,
        address: floor.address,
      }));
      setFloors(floorsData);
    } catch (error) {
      console.error("층 정보 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setEditName(floor.name);
    setEditAddress(floor.address || "");
  };

  const handleCancelEdit = () => {
    setEditingFloor(null);
    setEditName("");
    setEditAddress("");
  };

  const handleSave = async () => {
    if (!editingFloor || !editName.trim() || !editAddress.trim()) {
      alert("이름과 주소를 모두 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      await updateBuildingFloor(editingFloor.id, {
        name: editName.trim(),
        address: editAddress.trim(),
      });
      await fetchData();
      handleCancelEdit();
    } catch (error) {
      console.error("층 수정 실패:", error);
      alert("층 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (floor: Floor) => {
    if (!confirm(`정말로 "${floor.name}" 층을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteBuildingFloor(floor.id);
      await fetchData();
    } catch (error) {
      console.error("층 삭제 실패:", error);
      alert("층 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.container} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <h1 className={s.title}>공간 관리하기</h1>
          <button className={s.closeButton} onClick={onClose}>
            <X size={24} color="#8B8B8B" />
          </button>
        </div>
        <div className={s.content}>
          {loading ? (
            <div
              style={{ padding: "24px", textAlign: "center", color: "#8B8B8B" }}
            >
              로딩 중...
            </div>
          ) : (
            <>
              {floors.map((floor) => (
                <MapItem
                  key={floor.id}
                  title={floor.name}
                  description={floor.address || "주소 정보 없음"}
                  onEdit={() => handleEdit(floor)}
                  onDelete={() => handleDelete(floor)}
                />
              ))}
            </>
          )}
        </div>

        {/* 수정 모달 */}
        {editingFloor && (
          <div className={s.editModal}>
            <div className={s.editModalContent}>
              <h2 className={s.editModalTitle}>층 정보 수정</h2>
              <div className={s.editModalInputs}>
                <Input
                  label="층 이름"
                  placeholder="층 이름을 입력하세요"
                  required
                  value={editName}
                  onChange={setEditName}
                />
                <Input
                  label="주소"
                  placeholder="주소를 입력하세요"
                  required
                  value={editAddress}
                  onChange={setEditAddress}
                />
              </div>
              <div className={s.editModalButtons}>
                <Button
                  text="취소"
                  onClick={handleCancelEdit}
                  style={{ backgroundColor: "#EFF0F2", color: "#000" }}
                  disabled={isSaving}
                />
                <Button
                  text="저장"
                  onClick={handleSave}
                  disabled={isSaving || !editName.trim() || !editAddress.trim()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
