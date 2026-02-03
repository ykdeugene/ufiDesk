export interface LoginRequest {
  email: string;
  password: string;
  loginTime: string;
}

export interface LoginResponse {
  email: string;
  role: string;
  admin: boolean;
  message: string;
}

export interface SessionStatus {
  email: string;
  role: string;
  admin: boolean;
  message: string;
}

export interface UserProfileUpdateRequest {
  email: string;
  password?: string;
  updateTime: string;
}

export interface UserDto {
  email: string;
  admin: boolean;
  active: boolean;
}
