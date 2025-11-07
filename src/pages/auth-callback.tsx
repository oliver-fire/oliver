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
        const error = searchParams.get("error");

        if (error) {
          navigate("/login", { replace: true });
          return;
        }

        if (code) {
          try {
            await apiClient.get("/v1/auth/google/callback", {
              params: { code },
            });
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
