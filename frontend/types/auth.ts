export type UserRole = "PARENT" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: number;
}

export interface AuthError {
  message: string;
  code?: "invalid_credentials" | "email_in_use" | "validation" | "unknown";
}

export interface AuthResult {
  error: AuthError | null;
}
