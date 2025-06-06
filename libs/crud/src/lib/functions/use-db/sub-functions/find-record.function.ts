import { FilterQuery, Model } from 'mongoose';

export async function findRecord<T>( {
	model,
	query
}: {
  model: Model<T>;
  query: FilterQuery<T>;
} ): Promise<T | null> {
	const result = await model.findOne( query ).exec();
	return result ? result.toObject() : null;
}
