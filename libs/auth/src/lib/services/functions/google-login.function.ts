import { OAuth2Client } from 'google-auth-library';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { IUser } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../../base';
import { generateAndStoreTokens } from './manage-tokens.function';

interface ExecuteGoogleLoginParams {
  code: string;
  googleOAuthClientConfig: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService;
  jwtSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export async function executeGoogleLogin( {
	code,
	googleOAuthClientConfig,
	userModel,
	eventEmitter,
	jwtSecret,
	accessTokenExpiry,
	refreshTokenExpiry
}: ExecuteGoogleLoginParams ): Promise<{
  accessToken: string;
  refreshToken: string;
  user: Pick<IUser, '_id' | 'email' | 'firstName' | 'lastName'>;
}> {
	const oauth2Client = new OAuth2Client(
		googleOAuthClientConfig.clientId,
		googleOAuthClientConfig.clientSecret,
		googleOAuthClientConfig.redirectUri
	);

	// Exchange authorization code for tokens
	const { tokens: googleTokens } = await oauth2Client.getToken( code );
	if ( !googleTokens.id_token ) {
		throw new Error( 'GOOGLE_ID_TOKEN_MISSING' );
	}

	const loginTicket = await oauth2Client.verifyIdToken( {
		idToken: googleTokens.id_token,
		audience: googleOAuthClientConfig.clientId
	} );

	const payload = loginTicket.getPayload();
	if ( !payload ) {
		throw new Error( 'GOOGLE_PAYLOAD_MISSING' );
	}

	const googleId = payload.sub;
	const email = payload.email;
	const firstName = payload.given_name;
	const lastName = payload.family_name;
	const emailVerifiedByGoogle = payload.email_verified;

	if ( !email || !googleId ) {
		throw new Error( 'GOOGLE_DATA_INCOMPLETE' );
	}

	if ( !emailVerifiedByGoogle ) {
		throw new Error( 'GOOGLE_EMAIL_NOT_VERIFIED' );
	}

	// Check if user exists and is a Google user
	let appUser = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: { query: { provider: 'google', providerId: googleId } }
	} );

	if ( !appUser ) {
		// Check if user exists by email and is not a google user
		const existingUserByEmail = await ssCrud.useDb<IUser | null, DbOp.r>( {
			op: DbOp.r,
			model: userModel,
			config: { query: { email: email.toLowerCase() } }
		} );

		if ( existingUserByEmail && existingUserByEmail.provider !== 'google' ) {
			throw new Error( 'ACCOUNT_EXISTS_DIFFERENT_PROVIDER' );
		}

		// Create new user if not found by email or if found but is not a google user
		const dummyPassword = crypto.randomBytes( 32 ).toString( 'hex' );
		const passwordHash = await argon2.hash( dummyPassword );

		const newUserInput: Partial<IUser> = {
			email: email.toLowerCase(),
			firstName,
			lastName,
			isEmailVerified: true, // Email is verified by Google
			provider: 'google',
			providerId: googleId,
			passwordHash, // Store a dummy hash as password is not used
			isAccountLocked: false,
			failedLoginAttempts: 0
		};
		appUser = await ssCrud.useDb<IUser, DbOp.c>( {
			op: DbOp.c,
			model: userModel,
			config: { data: newUserInput }
		} );
	}

	if ( !appUser || !appUser._id ) {
		throw new Error( 'USER_LOGIN_CREATION_FAILED' );
	}

	// Update last login timestamp and reset failed attempts
	const updatedAppUser =
    ( await ssCrud.useDb<IUser | null, DbOp.u>( {
    	op: DbOp.u,
    	model: userModel,
    	config: {
    		query: { _id: appUser._id },
    		data: {
    			lastLoginAt: new Date(),
    			failedLoginAttempts: 0,
    			isAccountLocked: false
    		}
    	}
    } ) ) ?? appUser; // Fallback to appUser if update returns null

	const { accessToken, refreshToken } = await generateAndStoreTokens( {
		userId: updatedAppUser._id!.toString(),
		jwtSecret,
		accessTokenExpiry,
		refreshTokenExpiryString: refreshTokenExpiry
	} );

	eventEmitter.emit( 'userLoggedIn', updatedAppUser, { method: 'google' } );

	return {
		accessToken,
		refreshToken,
		user: {
			_id: updatedAppUser._id!.toString(),
			email: updatedAppUser.email,
			firstName: updatedAppUser.firstName,
			lastName: updatedAppUser.lastName
		}
	};
}
