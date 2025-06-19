import axios from 'axios';
import type { AuthResponse } from '@/types/user';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const signup = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/user/signup', { username, email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const signin = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/user/signin', { username, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};