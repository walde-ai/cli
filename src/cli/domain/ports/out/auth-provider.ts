import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Authentication result callbacks
 */
export interface AuthCallbacks {
  onSuccess: (credentials: Credentials) => void;
  onFailure: (error: Error) => void;
  onNewPasswordRequired: (setNewPassword: (newPassword: string) => void) => void;
}

/**
 * Authentication provider interface
 */
export interface AuthProvider {
  /**
   * Authenticate user with username and password
   */
  authenticate(username: string, password: string, callbacks: AuthCallbacks): Promise<void>;
}
