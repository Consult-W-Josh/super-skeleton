import { IUser } from '../../user';
import { DbOp, ssCrud, SsModel } from '@super-skeleton/crud';
import { AuthHookUser } from '../../types';

interface ExecuteGetCurrentUserParams {
  userId: string;
  userModel: SsModel<IUser>;
}

/**
 * Fetches a user's public profile from the database by their ID.
 * @param userId The ID of the user to fetch.
 * @param userModel The user model definition.
 * @returns The user's public profile or null if not found.
 */
export async function executeGetCurrentUser( {
	userId,
	userModel
}: ExecuteGetCurrentUserParams ): Promise<AuthHookUser | null> {
	const user = await ssCrud.useDb<IUser | null, DbOp.r>( {
		op: DbOp.r,
		model: userModel,
		config: {
			query: { _id: userId }
		}
	} );

	if ( !user ) {
		return null;
	}

	// Return only the public-safe fields defined by AuthHookUser
	return {
		_id: user._id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName
	};
} 