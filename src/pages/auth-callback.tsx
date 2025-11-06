import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/api/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 code나 token 파라미터 가져오기
        const code = searchParams.get("code");
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        // 에러가 있으면 로그인 페이지로 리다이렉트
        if (error) {
          console.error("OAuth 에러:", error);
          navigate("/login", { replace: true });
          return;
        }

        // 토큰이 직접 전달된 경우
        if (token) {
          // 토큰을 로컬 스토리지에 저장
          localStorage.setItem("token", token);
          // 홈으로 리다이렉트 (replace로 히스토리 정리)
          navigate("/", { replace: true });
          return;
        }

        // code가 전달된 경우, 백엔드로 GET 요청 (쿠키 주입)
        if (code) {
          try {
            // GET 요청으로 code를 쿼리 파라미터로 전송
            // 백엔드에서 쿠키를 주입해주므로 withCredentials: true 필요
            const response = await apiClient.get("/v1/auth/google/callback", {
              params: {
                code,
              },
              withCredentials: true, // 쿠키를 받기 위해 필요
            });
            
            // 백엔드가 응답으로 JWT 토큰을 반환하는 경우 (선택적)
            // 쿠키에 JWT가 포함되어 있으면 이 부분은 필요 없음
            if (response.data?.data?.token || response.data?.token) {
              const jwtToken = response.data?.data?.token || response.data?.token;
              localStorage.setItem("token", jwtToken);
            }
            
            // 쿠키가 주입되었으므로 홈으로 리다이렉트 (replace로 히스토리 정리)
            navigate("/", { replace: true });
          } catch (error) {
            console.error("로그인 처리 실패:", error);
            navigate("/login", { replace: true });
          }
          return;
        }

        // code나 token이 없지만 /auth/success로 온 경우
        // 백엔드가 이미 쿠키를 주입하고 리다이렉트한 경우일 수 있음
        // 홈으로 리다이렉트 시도
        if (window.location.pathname === "/auth/success") {
          navigate("/", { replace: true });
          return;
        }

        // 그 외의 경우 로그인 페이지로 리다이렉트
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Callback 처리 실패:", error);
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

