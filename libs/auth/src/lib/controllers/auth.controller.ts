import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services';
import {
	ForgotPasswordInput,
	ResetPasswordInput,
	UserLoginInput,
	UserRegistrationInput
} from '../user';

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
