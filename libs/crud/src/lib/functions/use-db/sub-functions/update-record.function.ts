import { FilterQuery, Model } from 'mongoose';

export async function updateRecords<T>( {
	model,
	query,
	data
}: {
  model: Model<T>;
  query: FilterQuery<T>;
  data: Partial<T>;
} ): Promise<boolean> {
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

	await model.updateMany( query, updateOps, {
		upsert: false
	} );
	return true;
}
