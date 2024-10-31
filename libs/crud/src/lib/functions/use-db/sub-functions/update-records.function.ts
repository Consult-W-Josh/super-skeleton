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
	const result = await model.findOneAndUpdate( query, data, {
		returnDocument: 'after',
		new: true,
		lean: true
	} );
	return result as T;
}
