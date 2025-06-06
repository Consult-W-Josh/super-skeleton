import { LogoutInput } from '../../user';
import { DbOp, ssCrud } from '@super-skeleton/crud';
import { IRefreshToken, RefreshTokenModel } from '../../token';
import { BaseEventEmitterService } from '../../base';

interface ExecuteLogoutParams {
  data: LogoutInput;
  eventEmitter: BaseEventEmitterService;
}

export async function executeLogout( {
	data,
	eventEmitter
}: ExecuteLogoutParams ): Promise<void> {
	const { refreshToken: refreshTokenString } = data;

	const storedRefreshToken = await ssCrud.useDb<IRefreshToken | null, DbOp.r>( {
		op: DbOp.r,
		model: RefreshTokenModel,
		config: {
			query: { token: refreshTokenString }
		}
	} );

	if ( storedRefreshToken && storedRefreshToken.userId ) {
		// Invalidate the token by setting its expiry to the past
		await ssCrud.useDb<IRefreshToken, DbOp.u>( {
			op: DbOp.u,
			model: RefreshTokenModel,
			config: {
				query: { _id: storedRefreshToken._id },
				data: { expiresAt: new Date( 0 ) } // Set to Unix epoch (or any past date)
			}
		} );

		eventEmitter.emit( 'userLoggedOut', {
			userId: storedRefreshToken.userId.toString(),
			token: refreshTokenString
		} );
		console.log(
			`[AuthService - Logout] Refresh token invalidated for user ID: ${storedRefreshToken.userId.toString()}`
		);
	} else {
		console.log(
			`[AuthService - Logout] Refresh token not found or already invalidated: ${refreshTokenString}`
		);
	}
}
