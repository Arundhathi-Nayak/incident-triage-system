export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
}

export interface CurrentUser {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
}