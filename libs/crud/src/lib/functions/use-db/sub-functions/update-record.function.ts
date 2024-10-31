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
	await model.updateMany( query, data, {
		upsert: false
	} );
	return true;
}
