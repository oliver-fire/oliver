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
        // 인증 상태 확인 API 호출 (예: /auth/me 또는 유사한 엔드포인트)
        // 백엔드에서 쿠키를 확인하여 인증 상태를 반환
        await apiClient.get("/v1/auth/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (error) {
        // 401 에러 또는 인증 실패 시
        setIsAuthenticated(false);
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

