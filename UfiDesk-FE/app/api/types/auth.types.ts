export interface LoginRequest {
  email: string;
  password: string;
  loginTime: string;
}

export interface LoginResponse {
  email: string;
  role: string;
  message: string;
}

export interface SessionStatus {
  email: string;
  role: string;
  message: string;
}
