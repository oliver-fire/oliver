import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import apiClient from "@/api/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  const redirectTo = (path: string) => {
    if (isLocal) {
      window.location.href = `http://localhost:5173${path}`;
    } else {
      navigate(path, { replace: true });
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 2) frontend callback page에서 query로 code라는 값을 받음
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          console.error("구글 로그인 에러:", error);
          redirectTo("/login");
          return;
        }

        if (code) {
          console.log("=== 구글 로그인 콜백 처리 ===");
          console.log("받은 code:", code);
          
          try {
            // 3) 백엔드서버도메인/v1/auth/google/callback?code=코드값 으로 GET 요청
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            const backendUrl = isLocal ? "https://oliver-api-staging.thnos.app" : "https://oliver-api.thnos.app";
            const callbackUrl = `${backendUrl}/v1/auth/google/callback?code=${code}`;
            
            console.log("콜백 요청 URL:", callbackUrl);
            
            // 4) 백엔드에서 알아서 프론트로 쿠키 주입해줌 (withCredentials: true로 설정되어 있음)
            await apiClient.get("/v1/auth/google/callback", {
              params: { code },
            });
            
            console.log("구글 로그인 성공, 메인 페이지로 이동");
            redirectTo("/");
          } catch (error: any) {
            console.error("구글 로그인 콜백 에러:", error);
            redirectTo("/login");
          }
          return;
        }

        if (window.location.pathname === "/auth/success") {
          redirectTo("/");
          return;
        }

        console.log("code가 없음, 로그인 페이지로 이동");
        redirectTo("/login");
      } catch (error) {
        console.error("콜백 처리 에러:", error);
        redirectTo("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#666",
      }}
    >
      로그인 처리 중...
    </div>
  );
}
