import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/shared/components/butoon";
import MainLayout from "@/shared/components/main-layout";
import s from "./styles.module.scss";
import BluetoothRobot from "@/components/page/robot/bluetooth-robot";
import { ArrowRight } from "lucide-react";
import { registerRobot, registerSensor, generateUUID } from "@/api/bot/service";
import { getAllBuildings } from "@/api/building/service";

type Step = "searching" | "found" | "registering" | "registered";
type DeviceType = "robot" | "sensor";

//1.로봇을 찾음
const FindRobot = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>로봇을 찾음</h1>
        <p className={s.description}>아래 표시되는 로봇이 맞나요?</p>
      </div>

      <BluetoothRobot name="소화로봇" serialNumber="OLV960XFH-X92AG" />

      <div className={s.buttons}>
        <Button
          text="다른 로봇 찾기"
          onClick={() => {}}
          style={{ width: "100%", backgroundColor: "#EFF0F2", color: "#000" }}
        />
        <Button text="네, 맞아요" onClick={onNext} style={{ width: "100%" }} />
      </div>
    </div>
  );
};

//2.로봇 등록중
const RegisterRobot = ({
  onNext,
  deviceType,
  floorId,
}: {
  onNext: () => void;
  deviceType: DeviceType;
  floorId: string;
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerDevice = async () => {
      try {
        setError(null);

        // 빌딩 정보 가져오기
        const buildingsResponse = await getAllBuildings();
        if (buildingsResponse.data.length === 0) {
          throw new Error("등록된 빌딩이 없습니다.");
        }

        const buildingId = buildingsResponse.data[0].id;
        const deviceId = generateUUID();
        // 디바이스 타입에 따라 이름 설정
        const deviceName = deviceType === "robot" ? "Oliver" : "Sensor";

        if (deviceType === "robot") {
          // 로봇 등록
          await registerRobot({
            id: deviceId,
            buildingId: buildingId,
            floorId: floorId,
            name: deviceName,
          });
        } else {
          // 센서 등록
          const sensorData = {
            id: deviceId,
            buildingId: buildingId,
            floorId: floorId,
            tuyaDeviceRegisterKey: "tuya-key-12345",
            name: deviceName,
            x: 0,
            y: 0,
          };
          console.log(
            "센서 등록 요청 데이터:",
            JSON.stringify(sensorData, null, 2)
          );
          await registerSensor(sensorData);
        }

        // 등록 성공 후 5초 뒤 다음 단계로
        setTimeout(() => {
          onNext();
        }, 5000);
      } catch (err: any) {
        console.error("디바이스 등록 실패:", err);
        setError(err.message || "등록에 실패했습니다.");
      }
    };

    registerDevice();
  }, [onNext, deviceType, floorId]);

  const deviceName = deviceType === "robot" ? "로봇" : "화재 감지기";

  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>{deviceName} 등록중</h1>
        <p className={s.description}>
          완료될 때까지 {deviceName}을 움직이거나 조작하지 말아주세요. 네트워크
          및 센서 상태를 초기화 중입니다.
        </p>
      </div>

      <BluetoothRobot
        name={deviceType === "robot" ? "소화로봇" : "화재 감지기"}
        serialNumber="OLV960XFH-X92AG"
      />

      {error ? (
        <p style={{ color: "#F03839" }}>등록 실패: {error}</p>
      ) : (
        <p style={{ color: "#000" }}>예상시간:1분</p>
      )}
    </div>
  );
};

//3.로봇 등록됨
const OkRobbot = ({ onExit }: { onExit: () => void }) => {
  useEffect(() => {
    // 5초 후 자동으로 홈으로 이동
    const timer = setTimeout(() => {
      onExit();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onExit]);

  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>로봇 등록됨</h1>
        <p className={s.description}>
          5초 뒤에 로봇 리스트 페이지로 이동합니다
        </p>
      </div>

      <BluetoothRobot name="소화로봇" serialNumber="OLV960XFH-X92AG" />

      <Button text="나가기" rightIcon={ArrowRight} onClick={onExit} />
    </div>
  );
};

//처음 시작
export default function Register2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("searching");
  const deviceType = (searchParams.get("type") || "robot") as DeviceType;
  const floorId = searchParams.get("floorId") || "";

  useEffect(() => {
    // 타입이나 floorId가 없으면 section1으로 리다이렉트
    if (!searchParams.get("type") || !searchParams.get("floorId")) {
      navigate("/robot/register/section1");
      return;
    }

    // 처음에 주변 로봇 찾는 중 화면에서 5초 후 자동으로 로봇을 찾음 단계로 이동
    if (step === "searching") {
      const timer = setTimeout(() => {
        setStep("found");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [step, searchParams, navigate]);

  const handleNext = () => {
    if (step === "found") {
      setStep("registering");
    } else if (step === "registering") {
      setStep("registered");
    }
  };

  const handleBack = () => {
    navigate("/robot/register/section1");
  };

  const handleExit = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (step) {
      case "searching":
        return (
          <>
            <div className={s.container}>
              <div className={s.content}>
                <h1 className={s.title}>주변 로봇 찾는 중...</h1>
                <p className={s.description}>
                  잠시 뒤 나오는 팝업에서 "OLV-FRI"로 시작하는 요소를
                  선택해주세요
                </p>
              </div>
              <img
                className={s.image}
                src="/sample/robot-link.svg"
                alt="find-robot"
              />
              <Button
                text="뒤로가기"
                onClick={handleBack}
                style={{ backgroundColor: "#EFF0F2", color: "#000" }}
              />
            </div>
          </>
        );
      case "found":
        return <FindRobot onNext={handleNext} />;
      case "registering":
        return (
          <RegisterRobot
            onNext={handleNext}
            deviceType={deviceType}
            floorId={floorId}
          />
        );
      case "registered":
        return <OkRobbot onExit={handleExit} />;
      default:
        return null;
    }
  };

  return <MainLayout>{renderContent()}</MainLayout>;
}
