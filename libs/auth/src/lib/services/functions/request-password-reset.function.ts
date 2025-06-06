import * as crypto from 'crypto';
import { ForgotPasswordInput, IUser } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../../base';

interface ExecuteRequestPasswordResetParams {
  data: ForgotPasswordInput;
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService;
}

const PASSWORD_RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000; // 1 hour

export async function executeRequestPasswordReset( {
	data,
	userModel,
	eventEmitter
}: ExecuteRequestPasswordResetParams ): Promise<void> {
	const email = data.email.toLowerCase();

	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { email }
		}
	} );

	if ( user ) {
		const passwordResetToken = crypto.randomBytes( 32 ).toString( 'hex' );
		const passwordResetTokenExpiresAt = new Date(
			Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_IN_MS
		);

		const updatedUser = await ssCrud.useDb<IUser | null, DbOp.u>( {
			op: DbOp.u,
			model: userModel,
			config: {
				query: { _id: user._id },
				data: { passwordResetToken, passwordResetTokenExpiresAt }
			}
		} );

		if ( updatedUser ) {
			eventEmitter.emit(
				'passwordResetRequested',
				updatedUser,
				passwordResetToken
			);
		} else {
			console.error(
				`[AuthService] Failed to update user record for password reset token for user: ${user.email}`
			);
		}
	} else {
		console.log(
			`[AuthService] Password reset requested for non-existent email: ${email}`
		);
	}
}
