import { EventEmitter } from 'events';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { ssCrud, DbOp } from '@super-skeleton/crud';
import { IUser, UserModel } from '../user';
import { UserRegistrationInput, UserLoginInput } from '../user';

interface AuthServiceOptions {
  jwtSecret: string;
  refreshJwtSecret: string;
  eventEmitter?: EventEmitter;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
}

export class AuthService {
	private readonly jwtSecret: string;
	private readonly refreshJwtSecret: string;
	private readonly accessTokenExpiry: string;
	private readonly refreshTokenExpiry: string;
	private eventEmitter: EventEmitter;

	constructor( private options: AuthServiceOptions ) {
		this.jwtSecret = options.jwtSecret;
		this.refreshJwtSecret = options.refreshJwtSecret;
		this.eventEmitter = options.eventEmitter || new EventEmitter();
		this.accessTokenExpiry = options.accessTokenExpiry || '15m';
		this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
	}

	public async registerUser( data: UserRegistrationInput ): Promise<IUser> {
		// Input Validation is assumed to be done by the calling layer.

		const existingUser = await ssCrud.useDb<IUser | null, DbOp.r>( {
			op: DbOp.r,
			model: UserModel,
			config: {
				query: { email: data.email.toLowerCase() }
			}
		} );

		if ( existingUser ) {
			throw new Error( 'EMAIL_ALREADY_EXISTS' );
		}

		let passwordHash: string;
		try {
			passwordHash = await argon2.hash( data.password );
		} catch ( err ) {
			console.error( 'Password hashing failed:', err );
			throw new Error( 'USER_REGISTRATION_FAILED_HASHING' );
		}

		const newUserPartial: Partial<IUser> = {
			email: data.email.toLowerCase(),
			username: data.username ? data.username.toLowerCase() : undefined,
			passwordHash,
			firstName: data.firstName,
			lastName: data.lastName,
			isEmailVerified: false,
			isAccountLocked: false,
			failedLoginAttempts: 0
		};

		const createdUser = await ssCrud.useDb<IUser, DbOp.c>( {
			op: DbOp.c,
			model: UserModel,
			config: { data: newUserPartial }
		} );

		if ( !createdUser ) {
			console.error(
				'User creation failed in database (returned null/undefined).'
			);
			throw new Error( 'USER_REGISTRATION_FAILED_DB' );
		}

		// Generate Email Verification Token (Placeholder)
		const verificationToken =
      'TODO:generate_secure_token_for_' + createdUser.email;

		this.eventEmitter.emit( 'userRegistered', createdUser, verificationToken );

		return createdUser;
	}

	public async loginUser( data: UserLoginInput ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Pick<IUser, '_id' | 'email' | 'firstName' | 'lastName'>;
  }> {
		const foundUser = await ssCrud.useDb<IUser | null, DbOp.r>( {
			op: DbOp.r,
			model: UserModel,
			config: {
				query: { email: data.emailOrUsername.toLowerCase() }
			}
		} );

		if ( !foundUser ) {
			throw new Error( 'INVALID_CREDENTIALS' ); // User not found
		}

		// Check Account Status
		if ( foundUser.isAccountLocked ) {
			throw new Error( 'ACCOUNT_LOCKED' );
		}

		if ( !foundUser.isEmailVerified ) {
			throw new Error( 'EMAIL_NOT_VERIFIED' );
		}

		// Verify User Password
		const isPasswordValid = await argon2.verify(
			foundUser.passwordHash,
			data.password
		);

		if ( !isPasswordValid ) {
			const updatedFailedAttempts = ( foundUser.failedLoginAttempts || 0 ) + 1;
			// TODO:  (Future task: Lock account after N attempts)
			await ssCrud.useDb<IUser, DbOp.u>( {
				op: DbOp.u,
				model: UserModel,
				config: {
					query: { _id: foundUser._id },
					data: { failedLoginAttempts: updatedFailedAttempts }
				}
			} );
			throw new Error( 'INVALID_CREDENTIALS' ); // Invalid password
		}

		// Reset failed attempts and update last login on successful login
		const userUpdates: Partial<IUser> = {
			failedLoginAttempts: 0,
			lastLoginAt: new Date()
		};

		const updatedUser = await ssCrud.useDb<IUser | null, DbOp.u>( {
			op: DbOp.u,
			model: UserModel,
			config: {
				query: { _id: foundUser._id },
				data: userUpdates
			}
		} );

		if ( !updatedUser ) {
			console.error(
				'Failed to update user record on successful login for user:',
				foundUser._id
			);
			throw new Error( 'LOGIN_FAILED_UPDATE_USER' );
		}

		const userIdString = updatedUser._id!.toString();
		const accessTokenPayload = { userId: userIdString, type: 'access' };
		const refreshTokenPayload = { userId: userIdString, type: 'refresh' };

		const accessToken = jwt.sign( accessTokenPayload, this.jwtSecret, {
			expiresIn: this.accessTokenExpiry as any
		} );
		const refreshToken = jwt.sign( refreshTokenPayload, this.refreshJwtSecret, {
			expiresIn: this.refreshTokenExpiry as any
		} );

		this.eventEmitter.emit( 'userLoggedIn', updatedUser, { method: 'password' } );

		return {
			accessToken,
			refreshToken,
			user: {
				_id: userIdString,
				email: updatedUser.email,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName
			}
		};
	}

	/**
   * Allows subscribing to events emitted by the AuthService.
   * @param eventName The name of the event to listen for.
   * @param listener The callback function to execute when the event is emitted.
   */
	public on( eventName: string, listener: ( ...args: any[] ) => void ): void {
		this.eventEmitter.on( eventName, listener );
	}

	/**
   * Allows removing a listener for an event.
   * @param eventName The name of the event.
   * @param listener The callback function to remove.
   */
	public off( eventName: string, listener: ( ...args: any[] ) => void ): void {
		this.eventEmitter.off( eventName, listener );
	}
}
