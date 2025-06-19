export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}