// Main package entry point for @super-skeleton/auth
export { initializeAuthModule } from './lib/initialize';

// Public types for configuration and hooks
export type {
	AuthModuleOptions,
	AuthHookUser,
	VerificationToken,
} from './lib/types';

// Re-export SsModel and IUser for convenience if consumers need to type userModel or work with user objects
// These are more for advanced use cases or if hooks need more than AuthHookUser.
// However, AuthHookUser is the primary type for hook payloads.
export type { IUser } from './lib/user/user.model';
export type { SsModel } from '@super-skeleton/crud';

// No public custom error classes are exported at this time.
// export { AuthenticationError, EmailAlreadyExistsError, ... } from './lib/errors';
