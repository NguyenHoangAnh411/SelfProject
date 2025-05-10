export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  hasProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  name: string;
  type: 'erc20' | 'erc721' | 'custom';
  sourceCode: string;
  createdBy: string;
  createdAt: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 