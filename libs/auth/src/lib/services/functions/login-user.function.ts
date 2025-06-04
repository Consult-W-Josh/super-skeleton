import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { IUser, UserLoginInput } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../../base';

const MAX_FAILED_LOGIN_ATTEMPTS = 5; // Define the threshold for account locking

async function findUserByEmailOrUsername(
	emailOrUsername: string,
	userModel: SsModel<IUser>
): Promise<IUser | null> {
	const processedInput = emailOrUsername.toLowerCase();

	const query = {
		$or: [{ email: processedInput }, { username: processedInput }]
	};

	return ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query
		}
	} );
}

function checkUserAccountStatus(
	user: IUser,
	requireEmailVerificationForLogin?: boolean
): void {
	if ( user.isAccountLocked ) {
		throw new Error( 'ACCOUNT_LOCKED' );
	}

	if (
		( requireEmailVerificationForLogin === undefined ||
      requireEmailVerificationForLogin === true ) &&
    !user.isEmailVerified
	) {
		throw new Error( 'EMAIL_NOT_VERIFIED' );
	}
}

async function verifyUserPassword(
	passwordHash: string,
	providedPassword: string
): Promise<boolean> {
	return argon2.verify( passwordHash, providedPassword );
}

async function handleFailedLoginAttempt(
	user: IUser,
	userModel: SsModel<IUser>
): Promise<void> {
	const updatedFailedAttempts = ( user.failedLoginAttempts || 0 ) + 1;

	const updates: Partial<IUser> = {
		failedLoginAttempts: updatedFailedAttempts
	};

	if ( updatedFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS ) {
		updates.isAccountLocked = true;
		// TODO: Emit an event here if an account gets locked
		// eventEmitter.emit('userAccountLocked', { userId: user._id });
	}

	await ssCrud.useDb<IUser, DbOp.u>( {
		op: DbOp.u,
		model: userModel,
		config: {
			query: { _id: user._id },
			data: updates // Use the determined updates
		}
	} );
}

async function updateUserLoginTimestamp(
	user: IUser,
	userModel: SsModel<IUser>
): Promise<IUser> {
	const userUpdates: Partial<IUser> = {
		failedLoginAttempts: 0,
		lastLoginAt: new Date()
	};
	const updatedUser = await ssCrud.useDb<IUser | null, DbOp.u>( {
		op: DbOp.u,
		model: userModel,
		config: {
			query: { _id: user._id },
			data: userUpdates
		}
	} );
	if ( !updatedUser ) {
		console.error(
			'Failed to update user record on successful login for user:',
			user._id
		);
		throw new Error( 'LOGIN_FAILED_UPDATE_USER' );
	}
	return updatedUser;
}

interface GenerateAuthTokensParams {
  userId: string;
  jwtSecret: string;
  refreshJwtSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

function generateAuthTokensForLogin( {
	userId,
	jwtSecret,
	refreshJwtSecret,
	accessTokenExpiry,
	refreshTokenExpiry
}: GenerateAuthTokensParams ): { accessToken: string; refreshToken: string } {
	const accessTokenPayload = { userId, type: 'access' };
	const refreshTokenPayload = { userId, type: 'refresh' };

	const accessToken = jwt.sign( accessTokenPayload, jwtSecret, {
		expiresIn: accessTokenExpiry as any
	} );
	const refreshToken = jwt.sign( refreshTokenPayload, refreshJwtSecret, {
		expiresIn: refreshTokenExpiry as any
	} );
	return { accessToken, refreshToken };
}

interface ExecuteLoginUserParams {
  data: UserLoginInput;
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService;
  jwtSecret: string;
  refreshJwtSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  requireEmailVerificationForLogin?: boolean;
}

export async function executeLoginUser( {
	data,
	userModel,
	eventEmitter,
	jwtSecret,
	refreshJwtSecret,
	accessTokenExpiry,
	refreshTokenExpiry,
	requireEmailVerificationForLogin
}: ExecuteLoginUserParams ): Promise<{
  accessToken: string;
  refreshToken: string;
  user: Pick<IUser, '_id' | 'email' | 'firstName' | 'lastName'>;
}> {
	const foundUser = await findUserByEmailOrUsername(
		data.emailOrUsername,
		userModel
	);

	if ( !foundUser ) {
		throw new Error( 'INVALID_CREDENTIALS' );
	}

	checkUserAccountStatus( foundUser, requireEmailVerificationForLogin );

	const isPasswordValid = await verifyUserPassword(
		foundUser.passwordHash,
		data.password
	);

	if ( !isPasswordValid ) {
		await handleFailedLoginAttempt( foundUser, userModel );
		throw new Error( 'INVALID_CREDENTIALS' );
	}

	const updatedUser = await updateUserLoginTimestamp( foundUser, userModel );

	const { accessToken, refreshToken } = generateAuthTokensForLogin( {
		userId: updatedUser._id!.toString(),
		jwtSecret,
		refreshJwtSecret,
		accessTokenExpiry,
		refreshTokenExpiry
	} );

	eventEmitter.emit( 'userLoggedIn', updatedUser, { method: 'password' } );

	return {
		accessToken,
		refreshToken,
		user: {
			_id: updatedUser._id!.toString(),
			email: updatedUser.email,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName
		}
	};
}
