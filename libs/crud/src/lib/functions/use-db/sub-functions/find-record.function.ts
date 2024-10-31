import { FilterQuery, Model } from 'mongoose';

export async function findRecord<T>( {
	model,
	query
}: {
  model: Model<T>;
  query: FilterQuery<T>;
} ): Promise<T> {
	const result = await model.findOne( query );
	return result.toObject();
}
