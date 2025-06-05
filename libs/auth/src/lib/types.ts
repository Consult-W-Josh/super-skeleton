import { SsModel } from '@super-skeleton/crud';
import { IUser } from './user';

/**
 * Options for initializing the AuthModule.
 */
export interface AuthModuleOptions {
  /** Secret key for signing JWT access tokens. */
  jwtSecret: string;
  /** Secret key for signing JWT refresh tokens. */
  refreshJwtSecret: string;
  /**
   * Expiry time for access tokens (e.g., "15m", "1h").
   * @default "15m"
   */
  accessTokenExpiry?: string;
  /**
   * Expiry time for refresh tokens (e.g., "7d", "30d").
   * @default "7d"
   */
  refreshTokenExpiry?: string;
  /**
   * Optional custom user model compatible with SsModel<IUser>.
   * If not provided, the default UserModel from the library will be used.
   */
  userModel?: SsModel<IUser>;
  /**
   * Hooks to tap into authentication events.
   */
  hooks?: {
    /**
     * Called after a user successfully registers.
     * @param user Basic information about the registered user.
     * @param verificationToken The token generated for email verification (if applicable).
     */
    onUserSignUp?: (
      user: AuthHookUser,
      verificationToken?: VerificationToken
    ) => void | Promise<void>;
    /**
     * Called after a user successfully logs in.
     * @param user Basic information about the logged-in user.
     * @param details Details about the login method.
     */
    onUserLogin?: (
      user: AuthHookUser,
      details: { method: string }
    ) => void | Promise<void>;
    /**
     * Called after a password reset has been successfully requested for a user.
     * @param user Basic information about the user.
     * @param passwordResetToken The token generated for resetting the password.
     */
    onPasswordResetRequested?: (
      user: AuthHookUser,
      passwordResetToken: string // The raw token
    ) => void | Promise<void>;
    /**
     * Called after a user's password has been successfully reset.
     * @param user Basic information about the user whose password was reset.
     */
    onPasswordResetCompleted?: (
      user: AuthHookUser
    ) => void | Promise<void>;
  };
  /**
   * If true, users must have their email verified to log in.
   * @default true
   */
  requireEmailVerificationForLogin?: boolean;
}

/**
 * Represents the publicly exposed user information for authentication hooks.
 */
export type AuthHookUser = Pick<
  IUser,
  '_id' | 'email' | 'firstName' | 'lastName'
>;

/**
 * Represents the type of a verification token string.
 * It can be a string or null if not applicable or not generated.
 */
export type VerificationToken = string | null;
