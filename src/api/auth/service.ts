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

export const login = async (data: LoginDto): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterDto): Promise<RegisterResponseDto> => {
  const response = await apiClient.post<RegisterResponseDto>("/auth/register", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const refreshToken = async (): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>("/auth/refresh");
  return response.data;
};



