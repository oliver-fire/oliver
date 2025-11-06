import axios from "axios";

// API 클라이언트 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://oliver-api.thnos.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키를 주고받기 위해 필요
});

// 요청 인터셉터 (인증 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에 JWT 토큰이 있으면 Authorization 헤더에 추가
    // 백엔드가 쿠키에 JWT를 넣어주는 경우 이 부분은 필요 없을 수 있음
    // 하지만 백엔드가 Authorization 헤더를 요구하는 경우를 대비
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      // 로그인 페이지가 아닌 경우에만 리다이렉트
      if (window.location.pathname !== "/login" && 
          window.location.pathname !== "/auth/callback" &&
          window.location.pathname !== "/auth/success") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


