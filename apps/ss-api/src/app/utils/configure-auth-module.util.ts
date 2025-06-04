import { AuthModuleOptions } from '@super-skeleton/auth';
import { secrets } from '../../environment';

type Secrets = typeof secrets;

export function configureAuthModuleOptions(
	appSecrets: Secrets
): AuthModuleOptions {
	return {
		jwtSecret: appSecrets.jwtSecret!,
		refreshJwtSecret: appSecrets.refreshJwtSecret!,
		hooks: {
			onUserSignUp: ( user, verificationToken ) => {
				console.log(
					`[Auth Hook - User SignUp]: User ${user.email} registered. Verification token (placeholder): ${verificationToken}`
				);
				// TODO: Implement email sending logic, using a notifications service
			},
			onUserLogin: ( user, details ) => {
				console.log(
					`[Auth Hook - User Login]: User ${user.email} logged in via ${details.method}.`
				);
			}
		},
		requireEmailVerificationForLogin: appSecrets.requireEmailVerificationForLogin
	};
}
