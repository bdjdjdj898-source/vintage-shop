// Authentication-related type definitions

// Base user identity from Telegram initData (no database interaction)
export interface TelegramUserIdentity {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: string;
  isFromInitData: true; // Flag to indicate this is initData-only identity
}

// Full authenticated user with database record
export interface AuthenticatedUser {
  id: number; // Database ID
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: string;
  isFromInitData?: false; // Optional, defaults to false for DB users
}

// Union type for req.user
export type RequestUser = AuthenticatedUser | TelegramUserIdentity;

// Type guard to check if user has database ID
export function hasDbId(user: RequestUser): user is AuthenticatedUser {
  return !user.isFromInitData && 'id' in user;
}

// Type guard to check if user is from initData only
export function isInitDataOnly(user: RequestUser): user is TelegramUserIdentity {
  return user.isFromInitData === true;
}