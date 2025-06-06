import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services';
import {
	ForgotPasswordInput,
	LogoutInput,
	RefreshTokenInput,
	ResendVerificationEmailInput,
	ResetPasswordInput,
	UserLoginInput,
	UserRegistrationInput
} from '../user';
import { OAuth2Client } from 'google-auth-library';
import * as crypto from 'crypto';
import { RequestWithUser } from '../middleware';

const OAUTH_STATE_COOKIE_NAME = 'ss_oauth_state';
const OAUTH_STATE_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	maxAge: 10 * 60 * 1000, // 10 minutes
	sameSite: 'lax' as const
};

export function createSignupController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const createdUser = await authService.registerUser(
        req.body as UserRegistrationInput
			);
			res.status( 201 ).json( {
				message:
          'User registered successfully. Please check your email to verify.',
				userId: createdUser._id
			} );
		} catch ( error ) {
			if ( error instanceof Error ) {
				if ( error.message === 'EMAIL_ALREADY_EXISTS' ) {
					return res.status( 409 ).json( { message: error.message } );
				}
			}
			next( error );
		}
	};
}

export function createResetPasswordController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			await authService.resetPassword( req.body as ResetPasswordInput );
			res
				.status( 200 )
				.json( { message: 'Password has been reset successfully.' } );
		} catch ( error ) {
			if ( error instanceof Error ) {
				switch ( error.message ) {
				case 'INVALID_OR_EXPIRED_TOKEN':
					return res.status( 400 ).json( { message: error.message } );
				case 'PASSWORD_RESET_FAILED':
					console.error( '[ResetPasswordController] Internal error: ', error );
					return res.status( 500 ).json( {
						message:
                'An unexpected error occurred while resetting your password.'
					} );
				}
			}
			next( error );
		}
	};
}

export function createForgotPasswordController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			await authService.requestPasswordReset( req.body as ForgotPasswordInput );
			// Returning a generic message to prevent email enumeration
			res.status( 200 ).json( {
				message:
          'If an account with that email exists, a password reset link has been sent.'
			} );
		} catch ( error ) {
			console.error( '[ForgotPasswordController] Error: ', error );
			res.status( 200 ).json( {
				message:
          'If an account with that email exists, a password reset link has been sent.'
			} );
		}
	};
}

export function createLoginController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { accessToken, refreshToken, user } = await authService.loginUser(
        req.body as UserLoginInput
			);
			res.status( 200 ).json( { accessToken, refreshToken, user } );
		} catch ( error ) {
			if ( error instanceof Error ) {
				switch ( error.message ) {
				case 'INVALID_CREDENTIALS':
					return res.status( 401 ).json( { message: error.message } );
				case 'ACCOUNT_LOCKED':
					return res.status( 403 ).json( { message: error.message } );
				case 'EMAIL_NOT_VERIFIED':
					return res.status( 403 ).json( { message: error.message } );
				}
			}
			next( error );
		}
	};
}

export function createVerifyEmailController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { token } = req.params;
			if ( !token ) {
				return res
					.status( 400 )
					.json( { message: 'Verification token is missing.' } );
			}

			const success = await authService.verifyUserEmail( token );

			if ( success ) {
				return res
					.status( 200 )
					.json( { message: 'Email verified successfully.' } );
			} else {
				return res.status( 400 ).json( {
					message:
            'Email verification failed. The token may be invalid or expired.'
				} );
			}
		} catch ( error ) {
			next( error );
		}
	};
}

export function createResendVerificationEmailController(
	authService: AuthService
) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			await authService.resendVerificationEmail(
        req.body as ResendVerificationEmailInput
			);
			res.status( 200 ).json( {
				message:
          'If an account with that email exists and is not yet verified, a new verification email has been sent.'
			} );
		} catch ( error ) {
			console.error( '[ResendVerificationEmailController] Error: ', error );
			res.status( 200 ).json( {
				message:
          'If an account with that email exists and is not yet verified, a new verification email has been sent.'
			} );
		}
	};
}

export function createRefreshTokenController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			const { accessToken, refreshToken } = await authService.refreshToken(
        req.body as RefreshTokenInput
			);
			res.status( 200 ).json( { accessToken, refreshToken } );
		} catch ( error ) {
			if ( error instanceof Error ) {
				switch ( error.message ) {
				case 'INVALID_REFRESH_TOKEN':
				case 'EXPIRED_REFRESH_TOKEN':
					return res
						.status( 401 )
						.json( { message: 'Invalid or expired refresh token.' } );
				case 'USER_NOT_FOUND_FOR_TOKEN':
					console.error(
						'[RefreshTokenController] User not found for a valid refresh token: ',
						req.body.refreshToken
					);
					return res.status( 403 ).json( { message: 'Forbidden.' } );
				default:
					console.error( '[RefreshTokenController] Unexpected error: ', error );
					return res
						.status( 500 )
						.json( { message: 'An internal error occurred.' } );
				}
			}
			next( error );
		}
	};
}

export function createLogoutController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			await authService.logout( req.body as LogoutInput );
			res.status( 204 ).send();
		} catch ( error ) {
			console.error( '[LogoutController] Internal error during logout: ', error );
			res.status( 204 ).send();
		}
	};
}

export function createGetCurrentUserController( authService: AuthService ) {
	return async ( req: RequestWithUser, res: Response, next: NextFunction ) => {
		try {
			// The user object is attached by the authenticate middleware.
			// If it's not present, the middleware should have already sent a 401.
			if ( !req.user?.userId ) {
				return res.status( 401 ).json( { message: 'Unauthorized' } );
			}

			const userProfile = await authService.getCurrentUser( req.user.userId );

			if ( !userProfile ) {
				// This can happen if the user is deleted after a token is issued.
				return res.status( 404 ).json( { message: 'User not found.' } );
			}

			res.status( 200 ).json( userProfile );
		} catch ( error ) {
			next( error );
		}
	};
}

export function createGoogleOAuthInitiateController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		if ( !authService.googleOAuthClient ) {
			return res
				.status( 500 )
				.json( { message: 'Google OAuth not configured on the server.' } );
		}
		try {
			const state = crypto.randomBytes( 32 ).toString( 'hex' );
			res.cookie( OAUTH_STATE_COOKIE_NAME, state, OAUTH_STATE_COOKIE_OPTIONS );

			const oauth2Client = new OAuth2Client(
				authService.googleOAuthClient.clientId,
				authService.googleOAuthClient.clientSecret,
				authService.googleOAuthClient.redirectUri
			);

			const authorizeUrl = oauth2Client.generateAuthUrl( {
				access_type: 'offline',
				scope: [
					'https://www.googleapis.com/auth/userinfo.profile',
					'https://www.googleapis.com/auth/userinfo.email'
				],
				state: state
				// prompt: 'consent', // force consent screen every time
			} );
			res.redirect( authorizeUrl );
		} catch ( error ) {
			console.error( '[GoogleOAuthInitiateController] Error:', error );
			next( error );
		}
	};
}

export function createGoogleOAuthCallbackController( authService: AuthService ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		if ( !authService.googleOAuthClient ) {
			return res
				.status( 500 )
				.json( { message: 'Google OAuth not configured on the server.' } );
		}

		const { code, state: returnedState } = req.query;
		const storedState = req.cookies[OAUTH_STATE_COOKIE_NAME];

		// Clear the state cookie immediately after retrieving it
		res.clearCookie( OAUTH_STATE_COOKIE_NAME, OAUTH_STATE_COOKIE_OPTIONS );

		const { successRedirectUrl, failureRedirectUrl } =
      authService.googleOAuthClient;

		if ( !code || typeof code !== 'string' ) {
			return res.redirect(
				`${failureRedirectUrl}?error=invalid_request&message=Missing_authorization_code`
			);
		}

		if ( !storedState || !returnedState || storedState !== returnedState ) {
			console.warn(
				'[GoogleOAuthCallbackController] State mismatch or missing state. Potential CSRF attack.'
			);
			return res.redirect(
				`${failureRedirectUrl}?error=state_mismatch&message=Invalid_state_parameter`
			);
		}

		try {
			const { accessToken, refreshToken, user } =
        await authService.loginWithGoogle( code );

			// Set auth tokens in cookies
			// Access token cookie (HttpOnly: false, so client-side JS can read it if needed, but short-lived)
			res.cookie( 'ss_access_token', accessToken, {
				httpOnly: false, // Or true if frontend doesn't need to read it directly
				secure: process.env.NODE_ENV === 'production',
				maxAge: 15 * 60 * 1000, // 15 minutes (should match access token expiry)
				sameSite: 'lax'
			} );

			// Refresh token cookie (HttpOnly: true, more secure)
			res.cookie( 'ss_refresh_token', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (should match refresh token expiry)
				sameSite: 'lax',
				path: '/auth/refresh-token' // Scope refresh token cookie to the refresh endpoint
			} );

			return res.redirect( successRedirectUrl );
		} catch ( error ) {
			console.error(
				'[GoogleOAuthCallbackController] Error during Google login:',
				error
			);
			let errorCode = 'login_failed';
			let errorMessage = 'An_unexpected_error_occurred_during_Google_login';
			if ( error instanceof Error ) {
				errorMessage = error.message;
				if ( errorMessage === 'ACCOUNT_EXISTS_DIFFERENT_PROVIDER' ) {
					errorCode = 'account_exists_different_provider';
					errorMessage =
            'An_account_already_exists_with_this_email_using_a_different_login_method.';
				} else if ( errorMessage === 'GOOGLE_EMAIL_NOT_VERIFIED' ) {
					errorCode = 'google_email_not_verified';
					errorMessage = 'Your_Google_email_is_not_verified.';
				} else if ( errorMessage.startsWith( 'GOOGLE_' ) ) {
					errorCode = errorMessage.toLowerCase();
				}
			}
			return res.redirect(
				`${failureRedirectUrl}?error=${errorCode}&message=${encodeURIComponent(
					errorMessage
				)}`
			);
		}
	};
}
