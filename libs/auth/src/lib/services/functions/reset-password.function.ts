import * as argon2 from 'argon2';
import { IUser, ResetPasswordInput } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../../base';

interface ExecuteResetPasswordParams {
  data: ResetPasswordInput;
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService; // For emitting success/failure or other events
}

export async function executeResetPassword( {
	data,
	userModel,
	eventEmitter
}: ExecuteResetPasswordParams ): Promise<void> {
	const { token, newPassword } = data;

	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { passwordResetToken: token }
		}
	} );

	if ( !user ) {
		throw new Error( 'INVALID_OR_EXPIRED_TOKEN' );
	}

	if (
		!user.passwordResetTokenExpiresAt ||
    user.passwordResetTokenExpiresAt < new Date()
	) {
		// Clean up the expired token from the user record even if it's already expired
		await ssCrud.useDb<IUser, DbOp.u>( {
			op: DbOp.u,
			model: userModel,
			config: {
				query: { _id: user._id },
				data: {
					passwordResetToken: undefined,
					passwordResetTokenExpiresAt: undefined
				}
			}
		} );
		throw new Error( 'INVALID_OR_EXPIRED_TOKEN' );
	}

	const newPasswordHash = await argon2.hash( newPassword );

	const updates: Partial<IUser> = {
		passwordHash: newPasswordHash,
		passwordResetToken: undefined,
		passwordResetTokenExpiresAt: undefined,
		failedLoginAttempts: 0, // Reset failed login attempts
		isAccountLocked: false // Unlock account if it was locked
	};

	const updatedUser = await ssCrud.useDb<IUser | null, DbOp.u>( {
		op: DbOp.u,
		model: userModel,
		config: {
			query: { _id: user._id },
			data: updates
		}
	} );

	if ( !updatedUser ) {
		console.error(
			`[AuthService] Failed to update user record after password reset for user: ${user.email}`
		);
		throw new Error( 'PASSWORD_RESET_FAILED' );
	}

	eventEmitter.emit( 'passwordResetCompleted', updatedUser );
}
