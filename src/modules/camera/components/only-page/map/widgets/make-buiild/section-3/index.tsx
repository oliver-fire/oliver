import { useState, useEffect, useRef } from "react";
import { ChevronDown, Layers2, Minus, Plus, Search, Plus as PlusIcon, Settings, Radar, X, Check, Pencil, Trash2, Check as CheckIcon } from "lucide-react";
import Button from "@/shared/components/butoon";
import s from "./styles.module.scss";
// TODO: API에서 데이터 가져오기
// import { getAllBuildings, updateBuilding, getAllDevices } from "@/api";
// import { BuildingDto, DeviceDto } from "@/api";
import MapViewer from "./map-viewer";
import { SmallFireRobot, SmallFireSensor } from "../../small0robot-components";
import { FireRobotDetailSection1, FireSensorDetailSection2 } from "@/modules/camera/widgets";

interface Robot {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: "robot" | "sensor";
}

interface Props {
  onComplete?: () => void;
  onAddSpace?: () => void;
}

export default function MakeBuildSection3({ onComplete: _onComplete, onAddSpace }: Props) {
  const [zoomLevel, setZoomLevel] = useState(50);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // TODO: BuildingDto 타입으로 변경
  const [building, setBuilding] = useState<any | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [draggedRobotId, setDraggedRobotId] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<"robot" | "sensor">("robot");
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<string | null>(null);
  const [editedFloorName, setEditedFloorName] = useState("");
  const dragStartRef = useRef({ x: 0, y: 0 });
  const robotsRef = useRef(robots);
  const draggedRobotIdRef = useRef<string | null>(null);
  const mapScaleRef = useRef(1);

  useEffect(() => {
    robotsRef.current = robots;
  }, [robots]);

  useEffect(() => {
    draggedRobotIdRef.current = draggedRobotId;
  }, [draggedRobotId]);

  useEffect(() => {
    mapScaleRef.current = mapScale;
  }, [mapScale]);
  
  useEffect(() => {
    // TODO: API에서 건물 데이터 가져오기
    // const buildings = await getAllBuildings();
    // if (buildings.length > 0) {
    //   const firstBuilding = buildings[0];
    //   setBuilding(firstBuilding);
    //   if (firstBuilding.floors.length > 0) {
    //     setSelectedFloor(firstBuilding.floors[0].name);
    //   }
    // }
  }, []);
  
  const floors = building?.floors || [];
  
  const filteredFloors = floors.filter((floor: any) => {
    const floorName = typeof floor === 'string' ? floor : floor.name;
    return floorName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const checkOverlap = (robot: Robot): boolean => {
    // 배율에 따라 컴포넌트 크기 조정 (기본 100px, mapScale이 0이면 기본값 1 사용)
    const currentScale = mapScale || 1;
    const robotWidth = 100 * currentScale;
    const robotHeight = 100 * currentScale;
    
    // 같은 위치에 다른 로봇이 있는지 확인 (화재감지기)
    return robots.some(r => 
      r.id !== robot.id && 
      r.type === "sensor" &&
      Math.abs((r.x * currentScale) - (robot.x * currentScale)) < robotWidth && 
      Math.abs((r.y * currentScale) - (robot.y * currentScale)) < robotHeight
    );
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-robot]')) return;
    setIsMapDragging(true);
    const startPos = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
    dragStartRef.current = startPos;
  };

  const handleRobotMouseDown = (e: React.MouseEvent, robotId: string) => {
    e.stopPropagation();
    setDraggedRobotId(robotId);
    const robot = robotsRef.current.find(r => r.id === robotId);
    if (!robot) return;
    const startPos = {
      x: e.clientX - robot.x * mapScaleRef.current,
      y: e.clientY - robot.y * mapScaleRef.current,
    };
    dragStartRef.current = startPos;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.1;
    const newZoom = Math.round(Math.min(200, Math.max(50, zoomLevel + delta)));
    setZoomLevel(newZoom);
  };

  const handleRobotDoubleClick = (robotId: string) => {
    setSelectedRobotId(robotId);
  };

  const handleEditFloor = (floor: string) => {
    setEditingFloor(floor);
    setEditedFloorName(floor);
  };

  const handleSaveFloor = () => {
    if (!building || !editingFloor) return;
    // TODO: API로 층 이름 업데이트
    // await updateFloor(building.buildingId, floorId, { name: editedFloorName });
    
    const updatedFloors = building.floors.map((floor: any) => 
      floor === editingFloor || (typeof floor === 'object' && floor.name === editingFloor)
        ? editedFloorName 
        : floor
    );
    const updatedBuilding = { ...building, floors: updatedFloors };
    setBuilding(updatedBuilding);
    
    // selectedFloor도 업데이트
    if (selectedFloor === editingFloor) {
      setSelectedFloor(editedFloorName);
    }
    
    setEditingFloor(null);
    setEditedFloorName("");
  };

  const handleDeleteFloor = (floorToDelete: string) => {
    if (!building) return;
    // TODO: API로 층 삭제
    // await deleteFloor(building.buildingId, floorId);
    
    const updatedFloors = building.floors.filter((floor: any) => 
      floor !== floorToDelete && (typeof floor === 'object' ? floor.name !== floorToDelete : true)
    );
    const updatedBuilding = { ...building, floors: updatedFloors };
    setBuilding(updatedBuilding);
    
    // 선택된 층이 삭제되면 첫 번째 층으로 변경
    if (selectedFloor === floorToDelete && updatedFloors.length > 0) {
      const firstFloor = typeof updatedFloors[0] === 'string' ? updatedFloors[0] : updatedFloors[0].name;
      setSelectedFloor(firstFloor);
    }
  };

  const handleMoveBuilding = () => {
    // TODO: 건물 이동 기능 구현
    console.log("건물 이동하기 클릭됨");
  };

  const getSelectedRobotDetail = () => {
    if (!selectedRobotId) return null;
    const robot = robots.find(r => r.id === selectedRobotId);
    if (!robot) return null;
    
    // TODO: API에서 디바이스 상세 정보 가져오기
    // return await getDeviceById(selectedRobotId);
    return robot;
  };

  const selectedRobotDetail = getSelectedRobotDetail();
  const isFireRobot = selectedRobotDetail && robots.find(r => r.id === selectedRobotId)?.type === "robot";

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMapDragging) {
        setMapOffset({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
      if (draggedRobotIdRef.current) {
        const newX = (e.clientX - dragStartRef.current.x) / mapScaleRef.current;
        const newY = (e.clientY - dragStartRef.current.y) / mapScaleRef.current;
        setRobots(robotsRef.current.map(robot =>
          robot.id === draggedRobotIdRef.current ? { ...robot, x: newX, y: newY } : robot
        ));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsMapDragging(false);
      setDraggedRobotId(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isMapDragging]);

  return (
    <div className={s.container}>
      <div className={s.controlBar}>
        <div className={s.buildingSelectorWrapper}>
          <button 
            className={s.buildingSelector}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={s.right}>
              <Layers2 size={20} className={s.buildingIcon} />
              <span className={s.buildingName}>{selectedFloor}</span>
              <div className={s.dropdownCircle}>
                <ChevronDown size={20} />
              </div>
            </div>
          </button>

          {isDropdownOpen && (
            <div className={s.dropdown}>
              {/* Search Section */}
              <div className={s.searchSection}>
                <div className={s.searchInput}>
                  <Search size={18} className={s.searchIcon} />
                  <input 
                    type="text"
                    placeholder="검색하기"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={s.searchField}
                  />
                </div>
              </div>

              {/* Floor List Section */}
              <div className={s.floorList}>
                {filteredFloors.map((floor) => (
                  <button
                    key={floor}
                    className={`${s.floorItem} ${floor === selectedFloor ? s.floorItemActive : ""}`}
                    onClick={() => {
                      setSelectedFloor(floor);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {floor}
                  </button>
                ))}
              </div>

              {/* Action Buttons Section */}
              <div className={s.actionSection}>
                <button 
                  className={s.actionButton}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onAddSpace?.();
                  }}
                >
                  <PlusIcon size={16} />
                  <span>공간 추가</span>
                </button>
                <button 
                  className={s.actionButton}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowManagementModal(true);
                  }}
                >
                  <Settings size={16} />
                  <span>관리</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={s.zoomControls}>
          <button 
            className={s.invertedButton}
            onClick={() => setZoomLevel(Math.max(0, zoomLevel - 10))}
          >
            <Minus size={20} />
          </button>
          <button className={s.zoomDisplay}>
            {zoomLevel}%
          </button>
          <button 
            className={s.invertedButton}
            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
          >
            <Plus size={20} /> 
          </button>
        </div>
      </div>

      <div
        onMouseDown={handleMapMouseDown}
        onWheel={handleWheel}
        style={{ width: "100%", height: "100%" }}
      >
        <MapViewer zoomLevel={zoomLevel} mapOffset={mapOffset} onMapScaleChange={setMapScale}>
          {robots.map((robot) => {
            const RobotComponent = robot.type === "sensor" ? SmallFireSensor : SmallFireRobot;
            const isOverlapped = checkOverlap(robot);
            const currentScale = mapScale || 1;
            return (
              <RobotComponent
                key={robot.id}
                name={robot.name}
                x={robot.x * currentScale}
                y={robot.y * currentScale}
                scale={currentScale}
                onMouseDown={(e) => handleRobotMouseDown(e, robot.id)}
                onDoubleClick={() => handleRobotDoubleClick(robot.id)}
                isOverlapped={isOverlapped}
              />
            );
          })}
        </MapViewer>
      </div>

      <div className={s.bottomBar}>
        <Button
          text="제품 추가하기"
          leftIcon={Plus}
          onClick={() => setShowProductSelector(true)}
        />

        <button className={s.rescanButton}>
          <Radar size={16} />
          <span>공간 다시 스캔하기</span>
        </button>
      </div>

      {showProductSelector && (
        <>
          <div className={s.overlay} onClick={() => setShowProductSelector(false)} />
          <div className={s.productSelectorWidget}>
            <div className={s.productSelectorHeader}>
              <h2 className={s.productSelectorTitle}>제품 선택</h2>
              <button 
                className={s.closeButton}
                onClick={() => setShowProductSelector(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className={s.productCards}>
              <div 
                className={`${s.productCard} ${selectedProductType === "robot" ? s.selected : ""}`}
                onClick={() => setSelectedProductType("robot")}
              >
                <h3 className={s.productCardTitle}>소화 로봇</h3>
                <p className={s.productCardDescription}>화재가 발생하였을 때 초기 진압을 하는 로봇입니다</p>
                <div className={s.productCardImage}>
                  <img src="/sample/fire-robot.svg" alt="소화 로봇" />
                </div>
                <div className={s.checkIndicator}>
                  {selectedProductType === "robot" ? (
                    <div className={s.checkBoxChecked}>
                      <Check size={16} color="white" />
                    </div>
                  ) : (
                    <div className={s.checkBox} />
                  )}
                </div>
              </div>

              <div 
                className={`${s.productCard} ${selectedProductType === "sensor" ? s.selected : ""}`}
                onClick={() => setSelectedProductType("sensor")}
              >
                <h3 className={s.productCardTitle}>화재 감지기</h3>
                <p className={s.productCardDescription}>올리버 시스템과 연동되어 화재를 감지합니다</p>
                <div className={s.productCardImage}>
                  <img src="/sample/fire-robot.svg" alt="화재 감지기" />
                </div>
                <div className={s.checkIndicator}>
                  {selectedProductType === "sensor" ? (
                    <div className={s.checkBoxChecked}>
                      <Check size={16} color="white" />
                    </div>
                  ) : (
                    <div className={s.checkBox} />
                  )}
                </div>
              </div>
            </div>

            <div className={s.productSelectorFooter}>
              <Button
                text="확인"
                onClick={() => {
                  // 현재 배율에 따라 위치와 크기 조정 (mapScale이 0이면 기본값 1 사용)
                  const currentScale = mapScale || 1;
                  const baseX = 100 / currentScale;
                  const baseY = 100 / currentScale;
                  const spacing = 10 / currentScale;
                  
                  const newRobot: Robot = {
                    id: `robot-${Date.now()}`,
                    name: selectedProductType === "robot" ? "RX-780" : "FS-101",
                    x: baseX + robots.length * spacing,
                    y: baseY + robots.length * spacing,
                    type: selectedProductType,
                  };
                  setRobots([...robots, newRobot]);
                  setShowProductSelector(false);
                }}
              />
            </div>
          </div>
        </>
      )}

      {selectedRobotId && selectedRobotDetail && (
        <>
          {/* 오버레이 */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 999,
            }}
            onClick={() => setSelectedRobotId(null)}
          />
          
          {/* 위젯 */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              paddingRight: "12px",
            }}
          >
            {isFireRobot ? (
              <FireRobotDetailSection1 
                robot={selectedRobotDetail as FireRobot}
                onClose={() => setSelectedRobotId(null)}
                onDelete={() => {
                  setRobots(robots.filter(r => r.id !== selectedRobotId));
                  setSelectedRobotId(null);
                }}
                onMoveBuilding={handleMoveBuilding}
              />
            ) : (
              <FireSensorDetailSection2 
                sensor={selectedRobotDetail as FireSensor}
                onClose={() => setSelectedRobotId(null)}
                onDelete={() => {
                  setRobots(robots.filter(r => r.id !== selectedRobotId));
                  setSelectedRobotId(null);
                }}
                onMoveBuilding={handleMoveBuilding}
              />
            )}
          </div>
        </>
      )}

      {showManagementModal && building && (
        <>
          <div className={s.overlay} onClick={() => setShowManagementModal(false)} />
          <div className={s.managementModal}>
            <div className={s.managementHeader}>
              <h2 className={s.managementTitle}>공간 관리하기</h2>
              <button 
                className={s.closeButton}
                onClick={() => setShowManagementModal(false)}
              >
                <X size={24} className={s.closeButtonIcon} />
              </button>
            </div>

            <div className={s.managementFloorList}>
              {filteredFloors.map((floor) => (
                <div key={floor} className={s.managementFloorItem}>
                  <div className={s.managementFloorLeft}>
                    <div className={s.managementFloorInfo}>
                    <div className={s.managementFloorLeftTop}>
                    <div className={s.managementFloorIcon}>
                      <Layers2 size={26} />
                    </div>
                    {editingFloor === floor ? (
                      <input
                        type="text"
                        value={editedFloorName}
                        onChange={(e) => setEditedFloorName(e.target.value)}
                        className={s.managementFloorNameInput}
                        autoFocus
                      />
                    ) : (
                      <div className={s.managementFloorName}>{floor}</div>
                    )}
                    </div>
                    
                     
                      <div className={s.managementFloorAddress}>{building.address}</div>
                    </div>
                  </div>
                  <div className={s.managementFloorActions}>
                    {editingFloor === floor ? (
                      <button 
                        className={s.managementSaveButton}
                        onClick={handleSaveFloor}
                      >
                        <CheckIcon size={24} />
                      </button>
                    ) : (
                      <button 
                        className={s.managementEditButton}
                        onClick={() => handleEditFloor(floor)}
                      >
                        <Pencil size={24} />
                      </button>
                    )}
                    {editingFloor !== floor && (
                      <button 
                        className={s.managementDeleteButton}
                        onClick={() => handleDeleteFloor(floor)}
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className={s.managementFooter}>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

