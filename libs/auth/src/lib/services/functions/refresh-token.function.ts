import { IUser, RefreshTokenInput } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { IRefreshToken, RefreshTokenModel } from '../../token';
import { generateAndStoreTokens } from './manage-tokens.function';

interface ExecuteRefreshTokenParams {
  data: RefreshTokenInput;
  userModel: SsModel<IUser>;
  jwtSecret: string;
  accessTokenExpiry: string;
  newRefreshTokenExpiry: string;
}

export async function executeRefreshToken( {
	data,
	userModel,
	jwtSecret,
	accessTokenExpiry,
	newRefreshTokenExpiry
}: ExecuteRefreshTokenParams ): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
	const { refreshToken: providedRefreshTokenString } = data;

	const storedRefreshToken = await ssCrud.useDb<IRefreshToken | null, DbOp.r>( {
		op: DbOp.r,
		model: RefreshTokenModel,
		config: {
			query: { token: providedRefreshTokenString }
		}
	} );

	if ( !storedRefreshToken || !storedRefreshToken.userId ) {
		throw new Error( 'INVALID_REFRESH_TOKEN' ); // Not found or malformed
	}

	if ( storedRefreshToken.expiresAt < new Date() ) {
		// Clean up the token by marking it as expired if it is.
		await ssCrud.useDb<IRefreshToken, DbOp.u>( {
			op: DbOp.u,
			model: RefreshTokenModel,
			config: {
				query: { _id: storedRefreshToken._id },
				data: { expiresAt: new Date( 0 ) } // Set expiry to distant past
			}
		} );
		throw new Error( 'EXPIRED_REFRESH_TOKEN' );
	}

	// Invalidate the used refresh token by marking it as expired.
	// This is a key part of refresh token rotation.
	const oldTokenId = storedRefreshToken._id;
	await ssCrud.useDb<IRefreshToken, DbOp.u>( {
		op: DbOp.u,
		model: RefreshTokenModel,
		config: {
			query: { _id: oldTokenId },
			data: { expiresAt: new Date( 0 ) } // Set expiry to distant past
		}
	} );

	// Fetch the associated user
	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { _id: storedRefreshToken.userId }
		}
	} );

	if ( !user ) {
		// This case should be rare if the refresh token was valid and linked to a user.
		// It might indicate a data integrity issue or that the user was deleted
		// after the refresh token was issued.
		throw new Error( 'USER_NOT_FOUND_FOR_TOKEN' );
	}

	// Generate and store new tokens using the shared function
	return generateAndStoreTokens( {
		userId: user._id!.toString(),
		jwtSecret,
		accessTokenExpiry,
		refreshTokenExpiryString: newRefreshTokenExpiry
	} );
}
