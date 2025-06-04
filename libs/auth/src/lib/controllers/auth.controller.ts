import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services';
import { UserLoginInput, UserRegistrationInput } from '../user';

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
