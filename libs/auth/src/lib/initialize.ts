import { Router } from 'express';
import { AuthService } from './services';
import { createAuthRouter } from './routes';
import { AuthHookUser, AuthModuleOptions, VerificationToken } from './types';
import { IUser } from './user';

export function initializeAuthModule( options: AuthModuleOptions ): Router {
	if ( !options.jwtSecret || !options.refreshJwtSecret ) {
		throw new Error(
			'AuthModule requires jwtSecret and refreshJwtSecret to be provided.'
		);
	}

	const authService = new AuthService( {
		jwtSecret: options.jwtSecret,
		refreshJwtSecret: options.refreshJwtSecret,
		accessTokenExpiry: options.accessTokenExpiry,
		refreshTokenExpiry: options.refreshTokenExpiry,
		userModel: options.userModel,
		requireEmailVerificationForLogin: options.requireEmailVerificationForLogin
	} );

	// Register Hooks
	if ( options.hooks?.onUserSignUp ) {
		authService.on(
			'userRegistered',
			async ( user: IUser, verificationTokenValue: string ) => {
				const hookUser: AuthHookUser = {
					_id: user._id!,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName
				};
				const tokenForHook: VerificationToken = verificationTokenValue || null;
				await options.hooks!.onUserSignUp!( hookUser, tokenForHook );
			}
		);
	}

	if ( options.hooks?.onUserLogin ) {
		authService.on(
			'userLoggedIn',
			async ( user: IUser, details: { method: string } ) => {
				const hookUser: AuthHookUser = {
					_id: user._id!,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName
				};
				await options.hooks?.onUserLogin?.( hookUser, details );
			}
		);
	}

	return createAuthRouter( authService );
}
