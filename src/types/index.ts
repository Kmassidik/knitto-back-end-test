export interface User {
  id: number;
  email?: string;
  phone?: string;
  password_hash?: string;
  created_at: Date;
}

export interface JWTPayload {
  userId: number;
  email?: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Invoice {
  id: number;
  code: string;
  date_prefix: string;
  sequence_number: number;
  data: any;
  created_at: Date;
}
