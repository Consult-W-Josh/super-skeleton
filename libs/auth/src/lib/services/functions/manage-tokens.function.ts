import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DbOp, ssCrud } from '@super-skeleton/crud';
import { IRefreshToken, RefreshTokenModel } from '../../token';
import { parseExpiryToMs } from '../../utils';

interface GenerateAndStoreTokensParams {
  userId: string;
  jwtSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiryString: string; // e.g., '7d'
}

export async function generateAndStoreTokens( {
	userId,
	jwtSecret,
	accessTokenExpiry,
	refreshTokenExpiryString
}: GenerateAndStoreTokensParams ): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
	const accessTokenPayload = { userId, type: 'access' };
	const accessToken = jwt.sign( accessTokenPayload, jwtSecret, {
		expiresIn: accessTokenExpiry as any
	} );

	// Generate opaque refresh token
	const opaqueRefreshToken = crypto.randomBytes( 64 ).toString( 'hex' );
	const refreshTokenExpiresInMs = parseExpiryToMs( refreshTokenExpiryString );
	const refreshTokenExpiresAt = new Date( Date.now() + refreshTokenExpiresInMs );

	// Store the opaque refresh token in the database
	await ssCrud.useDb<IRefreshToken, DbOp.c>( {
		op: DbOp.c,
		model: RefreshTokenModel,
		config: {
			data: {
				token: opaqueRefreshToken,
				userId: userId,
				expiresAt: refreshTokenExpiresAt
			}
		}
	} );

	return { accessToken, refreshToken: opaqueRefreshToken };
}
