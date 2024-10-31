import { FilterQuery, Model } from 'mongoose';

export async function findRecords<T>( {
	model,
	query
}: {
  model: Model<T>;
  query: FilterQuery<T>;
} ): Promise<Array<T>> {
	const result = await model.find( query );
	return result;
}
