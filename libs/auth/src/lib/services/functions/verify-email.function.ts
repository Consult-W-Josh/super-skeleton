import { IUser } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';

interface ExecuteEmailVerificationParams {
  token: string;
  userModel: SsModel<IUser>;
}

export async function executeEmailVerification( {
	token,
	userModel
}: ExecuteEmailVerificationParams ): Promise<boolean> {
	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { emailVerificationToken: token }
		}
	} );

	if ( !user ) {
		return false;
	}

	if (
		!user.emailVerificationTokenExpiresAt ||
    user.emailVerificationTokenExpiresAt < new Date()
	) {
		return false;
	}

	const updates: Partial<IUser> = {
		isEmailVerified: true,
		emailVerificationToken: undefined,
		emailVerificationTokenExpiresAt: undefined
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
			`Failed to update user ${user._id} after token verification.`
		);
		return false;
	}

	return true;
}
