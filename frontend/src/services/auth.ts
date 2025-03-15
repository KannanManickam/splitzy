import { axiosInstance } from './axiosInstance';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/users/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Remove any potential duplicate '/api' prefix as it's already in the baseURL
  const response = await axiosInstance.post('/users/register', data);
  return response.data;
};