import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { IUser, UserRegistrationInput } from '../../user';
import { BaseEventEmitterService } from '../../base';

async function checkIfUserExistsByEmail(
	email: string,
	userModel: SsModel<IUser>
): Promise<IUser | null> {
	return ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { email: email.toLowerCase() }
		}
	} );
}

async function hashUserPassword( password: string ): Promise<string> {
	try {
		return await argon2.hash( password );
	} catch ( err ) {
		console.error( 'Password hashing failed:', err );
		throw new Error( 'USER_REGISTRATION_FAILED_HASHING' );
	}
}

async function createNewUserRecord(
	userData: Partial<IUser>,
	userModel: SsModel<IUser>
): Promise<IUser> {
	const createdUser = await ssCrud.useDb<IUser, DbOp.c>( {
		op: DbOp.c,
		model: userModel,
		config: { data: userData }
	} );
	if ( !createdUser ) {
		console.error(
			'User creation failed in database (returned null/undefined).'
		);
		throw new Error( 'USER_REGISTRATION_FAILED_DB' );
	}
	return createdUser;
}

function generateEmailVerificationToken(): string {
	return crypto.randomBytes( 32 ).toString( 'hex' );
}

interface ExecuteRegisterUserParams {
  data: UserRegistrationInput;
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService;
}

export async function executeRegisterUser( {
	data,
	userModel,
	eventEmitter
}: ExecuteRegisterUserParams ): Promise<IUser> {
	const existingUser = await checkIfUserExistsByEmail( data.email, userModel );
	if ( existingUser ) {
		throw new Error( 'EMAIL_ALREADY_EXISTS' );
	}

	const passwordHash = await hashUserPassword( data.password );
	const emailVerificationToken = generateEmailVerificationToken();
	const emailVerificationTokenExpiresAt = new Date(
		Date.now() + 24 * 60 * 60 * 1000
	); // 24 hours from now

	const newUserPartial: Partial<IUser> = {
		email: data.email.toLowerCase(),
		username: data.username ? data.username.toLowerCase() : undefined,
		passwordHash,
		firstName: data.firstName,
		lastName: data.lastName,
		isEmailVerified: false,
		emailVerificationToken,
		emailVerificationTokenExpiresAt,
		isAccountLocked: false,
		failedLoginAttempts: 0
	};

	const createdUser = await createNewUserRecord( newUserPartial, userModel );

	eventEmitter.emit( 'userRegistered', createdUser, emailVerificationToken );

	return createdUser;
}
