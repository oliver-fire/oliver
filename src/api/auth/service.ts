import apiClient from "../client";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * 로그인
 */
export const login = async (data: LoginDto): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>("/auth/login", data);
  return response.data;
};

/**
 * 회원가입
 */
export const register = async (
  data: RegisterDto,
): Promise<RegisterResponseDto> => {
  const response = await apiClient.post<RegisterResponseDto>(
    "/auth/register",
    data,
  );
  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>("/auth/refresh");
  return response.data;
};
