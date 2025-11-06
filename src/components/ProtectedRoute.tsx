import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import apiClient from "@/api/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("인증 상태 확인 중...", window.location.pathname);
        // 인증 상태 확인 API 호출
        // 백엔드에서 쿠키를 확인하여 인증 상태를 반환
        // apiClient에 이미 withCredentials: true가 설정되어 있음
        const response = await apiClient.get("/v1/auth/@me");
        console.log("인증 성공:", response.data);
        setIsAuthenticated(true);
      } catch (error: any) {
        // 401 에러 또는 인증 실패 시
        const status = error.response?.status;
        console.log("인증 실패:", status, error.response?.data);
        
        // CORS 에러가 아닌 경우에만 인증 실패로 처리
        if (status === 401) {
          // 401은 인증되지 않은 상태이므로 로그인 페이지로 리다이렉트
          setIsAuthenticated(false);
        } else if (!error.response) {
          // 네트워크 에러나 CORS 에러인 경우
          console.error("네트워크 에러:", error.message);
          setIsAuthenticated(false);
        } else {
          // 기타 에러
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  // 인증 상태 확인 중
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#666"
      }}>
        로딩 중...
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}

