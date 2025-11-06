import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/api/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          navigate("/login", { replace: true });
          return;
        }

        if (token) {
          navigate("/", { replace: true });
          return;
        }

        if (code) {
          try {
            // 백엔드로 GET 요청: /v1/auth/google/callback?code=코드값
            // 백엔드가 accessToken을 쿠키로 주입해줌
            const response = await apiClient.get("/v1/auth/google/callback", {
              params: { code },
            });
            
            // 백엔드가 응답 본문에 accessToken을 포함하는 경우도 대비
            // 쿠키가 제대로 전송되지 않을 경우를 위해 localStorage에도 저장
            if (response.data?.accessToken || response.data?.data?.accessToken) {
              const token = response.data?.accessToken || response.data?.data?.accessToken;
              localStorage.setItem("accessToken", token);
            }
            
            navigate("/", { replace: true });
          } catch (error: any) {
            navigate("/login", { replace: true });
          }
          return;
        }

        if (window.location.pathname === "/auth/success") {
          navigate("/", { replace: true });
          return;
        }

        navigate("/login", { replace: true });
      } catch (error) {
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontSize: "16px",
      color: "#666"
    }}>
      로그인 처리 중...
    </div>
  );
}

