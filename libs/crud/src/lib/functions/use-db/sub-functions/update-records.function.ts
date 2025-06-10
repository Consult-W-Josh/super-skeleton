import { FilterQuery, Model } from 'mongoose';

export async function updateRecord<T>( {
	model,
	query,
	data
}: {
  model: Model<T>;
  query: FilterQuery<T>;
  data: Partial<T>;
} ): Promise<T> {
	const updateOps: { $set?: Partial<T>; $unset?: Record<string, string> } = {};
	const setOps: Partial<T> = {};
	const unsetOps: Record<string, string> = {};

	let hasSetOps = false;
	let hasUnsetOps = false;

	for ( const key in data ) {
		if ( Object.prototype.hasOwnProperty.call( data, key ) ) {
			const typedKey = key as keyof T;
			if ( data[typedKey] === undefined ) {
				unsetOps[typedKey as string] = "";
				hasUnsetOps = true;
			} else {
				setOps[typedKey] = data[typedKey];
				hasSetOps = true;
			}
		}
	}

	if ( hasSetOps ) {
		updateOps.$set = setOps;
	}
	if ( hasUnsetOps ) {
		updateOps.$unset = unsetOps;
	}

	const result = await model.findOneAndUpdate( query, updateOps, {
		returnDocument: 'after',
		new: true,
		lean: true
	} );
	return result as T;
}
