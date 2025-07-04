import { Router } from 'express';
import { AuthService } from './services';
import { createAuthRouter } from './routes';
import { AuthHookUser, AuthModuleOptions, VerificationToken } from './types';
import { IUser } from './user';
import { createAuthenticateJwtMiddleware } from './middleware';

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
		requireEmailVerificationForLogin: options.requireEmailVerificationForLogin,
		googleOAuth: options.googleOAuth
	} );

	// Create middleware with the secret from the options
	const authenticateJwt = createAuthenticateJwtMiddleware( options.jwtSecret );

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
				const tokenForHook: VerificationToken = verificationTokenValue ?? null;
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

	if ( options.hooks?.onPasswordResetRequested ) {
		authService.on(
			'passwordResetRequested',
			async ( user: IUser, passwordResetToken: string ) => {
				const hookUser: AuthHookUser = {
					_id: user._id!,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName
				};
				await options.hooks!.onPasswordResetRequested!(
					hookUser,
					passwordResetToken
				);
			}
		);
	}

	if ( options.hooks?.onPasswordResetCompleted ) {
		authService.on( 'passwordResetCompleted', async ( user: IUser ) => {
			const hookUser: AuthHookUser = {
				_id: user._id!,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName
			};
			await options.hooks!.onPasswordResetCompleted!( hookUser );
		} );
	}

	if ( options.hooks?.onVerificationEmailResent ) {
		authService.on(
			'verificationEmailResent',
			async ( user: IUser, verificationTokenValue: string ) => {
				const hookUser: AuthHookUser = {
					_id: user._id!,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName
				};
				const tokenForHook: VerificationToken = verificationTokenValue ?? null;
				await options.hooks!.onVerificationEmailResent!( hookUser, tokenForHook );
			}
		);
	}

	// Pass both service and middleware to the router factory
	return createAuthRouter( { authService, authenticateJwt } );
}
