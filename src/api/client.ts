import * as Sentry from "@sentry/react";
import axios, { AxiosError } from "axios";

let tokenCache: string | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 100;

// API 에러를 위한 커스텀 에러 클래스
class ApiError extends Error {
  constructor(
    message: string,
    public url: string,
    public method: string,
    public statusCode?: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    // 스택 트레이스를 현재 위치에서 시작하도록 설정
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

const getCookie = (name: string): string | null => {
  console.log("=== Cookie Debug ===");
  console.log("All cookies:", document.cookie);
  console.log("Looking for cookie:", name);

  const cookies = document.cookie.split(";");
  console.log("Split cookies:", cookies);

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    console.log(`Checking cookie[${i}]:`, cookie);
    if (cookie.startsWith(`${name}=`)) {
      const value = cookie.substring(name.length + 1);
      console.log("Found cookie value:", value);
      return value;
    }
  }
  console.log("Cookie not found");
  return null;
};

const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmZjMzlmZC1kNzVkLTQwZGEtODkxYi1kOGZhMzdmNWQ3MmEiLCJlbWFpbCI6ImJzbm8wNzI3QGdtYWlsLmNvbSIsImdvb2dsZUlkIjoiMTAyOTc1OTU2MTkwMjY4MTI3Mjc1IiwiaWF0IjoxNzYyNDM5OTc2LCJleHAiOjE3NjMwNDQ3NzZ9.ooJ11XfJGxtCWv_GAgq-meOy96-ToHabyzcMZ1VuuAk";

const getToken = (): string | null => {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_DURATION && tokenCache) {
    return tokenCache;
  }

  const cookieToken = getCookie("accessToken");
  const localStorageToken = localStorage.getItem("accessToken");

  const token = cookieToken || localStorageToken || TEST_TOKEN;

  tokenCache = token;
  cacheTimestamp = now;

  return token;
};

export const apiClient = axios.create({
  baseURL: "https://oliver-api-staging.thnos.app/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("=== API Request ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method?.toUpperCase());
    console.log("Token:", token ? `${token.substring(0, 20)}...` : "없음");
    console.log("Full Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const url = error.config?.url || "unknown";
    const method = error.config?.method?.toUpperCase() || "unknown";
    const apiError = new ApiError(
      `API Request Error: ${error.message}`,
      url,
      method,
    );

    // Sentry에 요청 에러 기록 (커스텀 에러 사용으로 스택 트레이스 단순화)
    Sentry.captureException(apiError, {
      tags: {
        error_type: "api_request_error",
        url,
        method,
      },
      contexts: {
        api: {
          type: "request",
          url,
          method,
          original_error: error.message,
        },
      },
      // 스택 트레이스 단순화를 위해 원본 에러 스택 제거
      fingerprint: ["api-request-error", url, method],
    });
    throw apiError;
  },
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("=== API Response ===");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error("=== API Error ===");
    console.error("URL:", error.config?.url);
    console.error("Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);
    console.error("Error Message:", error.message);

    const url = error.config?.url || "unknown";
    const method = error.config?.method?.toUpperCase() || "unknown";
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    // 명확한 에러 메시지 생성
    let errorMessage = `API Error: ${method} ${url}`;
    if (statusCode) {
      errorMessage += ` - Status ${statusCode}`;
    }
    if (error.message) {
      errorMessage += ` - ${error.message}`;
    }

    // 커스텀 에러 생성 (스택 트레이스 단순화)
    const apiError = new ApiError(
      errorMessage,
      url,
      method,
      statusCode,
      responseData,
    );

    // Sentry에 API 응답 에러 상세 기록
    Sentry.captureException(apiError, {
      tags: {
        error_type: "api_response_error",
        http_status: statusCode?.toString() || "unknown",
        api_url: url,
        api_method: method,
      },
      contexts: {
        api: {
          url,
          method,
          status_code: statusCode || null,
          response_data: responseData || null,
          full_url: error.config?.baseURL
            ? `${error.config.baseURL}${url}`
            : url,
        },
      },
      extra: {
        request_data: error.config?.data,
        response_status_text: error.response?.statusText,
        axios_error_code: error.code,
        request_headers: error.config?.headers,
        response_headers: error.response?.headers,
      },
      // 동일한 에러를 그룹화하기 위한 fingerprint
      fingerprint: [
        "api-response-error",
        method,
        url,
        statusCode?.toString() || "no-status",
      ],
    });

    throw apiError;
  },
);

export default apiClient;
