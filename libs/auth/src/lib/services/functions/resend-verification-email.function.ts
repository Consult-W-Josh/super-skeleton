import * as crypto from 'crypto';
import { IUser, ResendVerificationEmailInput } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../../base';

interface ExecuteResendVerificationEmailParams {
  data: ResendVerificationEmailInput;
  userModel: SsModel<IUser>;
  eventEmitter: BaseEventEmitterService;
}

const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function executeResendVerificationEmail( {
	data,
	userModel,
	eventEmitter
}: ExecuteResendVerificationEmailParams ): Promise<void> {
	const email = data.email.toLowerCase();

	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { email }
		}
	} );

	if ( !user ) {
		console.log(
			`[AuthService] Request to resend verification for non-existent email: ${email}`
		);
		return;
	}

	if ( user.isEmailVerified ) {
		console.log(
			`[AuthService] Request to resend verification for already verified email: ${email}`
		);
		return;
	}

	// Generate a new token and expiry
	const newEmailVerificationToken = crypto.randomBytes( 32 ).toString( 'hex' );
	const newEmailVerificationTokenExpiresAt = new Date(
		Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MS
	);

	const updatedUser = await ssCrud.useDb<IUser | null, DbOp.u>( {
		op: DbOp.u,
		model: userModel,
		config: {
			query: { _id: user._id },
			data: {
				emailVerificationToken: newEmailVerificationToken,
				emailVerificationTokenExpiresAt: newEmailVerificationTokenExpiresAt
			}
		}
	} );

	if ( updatedUser ) {
		eventEmitter.emit(
			'verificationEmailResent',
			updatedUser,
			newEmailVerificationToken
		);
	} else {
		console.error(
			`[AuthService] Failed to update user record for resending verification email for user: ${user.email}`
		);
	}
}
