export type UserRole = "ATTENDEE" | "HOST" | "ADMIN";

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  profilePictureUrl?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  isActive: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
};

export type AuthResponse = {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
};

export type PasswordChangeRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ProfileUpdateRequest = {
  fullName?: string;
  phone?: string;
  profilePictureUrl?: string;
};
