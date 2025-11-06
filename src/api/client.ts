import axios from "axios";

let tokenCache: string | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 100;

const getCookie = (name: string): string | null => {
  console.log("=== Cookie Debug ===");
  console.log("All cookies:", document.cookie);
  console.log("Looking for cookie:", name);
  
  const cookies = document.cookie.split(';');
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

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YmZjMzlmZC1kNzVkLTQwZGEtODkxYi1kOGZhMzdmNWQ3MmEiLCJlbWFpbCI6ImJzbm8wNzI3QGdtYWlsLmNvbSIsImdvb2dsZUlkIjoiMTAyOTc1OTU2MTkwMjY4MTI3Mjc1IiwiaWF0IjoxNzYyNDM5OTc2LCJleHAiOjE3NjMwNDQ3NzZ9.ooJ11XfJGxtCWv_GAgq-meOy96-ToHabyzcMZ1VuuAk";

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
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://oliver-api.thnos.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
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
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("=== API Response ===");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    return response;
  },
  (error) => {
    console.error("=== API Error ===");
    console.error("URL:", error.config?.url);
    console.error("Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);
    console.error("Error Message:", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;


