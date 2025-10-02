export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'ACCOUNTANT';
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
