import { FilterQuery, Model } from 'mongoose';

export async function findRecords<T>( {
	model,
	query
}: {
  model: Model<T>;
  query: FilterQuery<T>;
} ): Promise<Array<T>> {
	return model.find( query );
}
