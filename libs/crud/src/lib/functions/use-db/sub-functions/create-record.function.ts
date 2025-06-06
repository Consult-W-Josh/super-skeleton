import { Model } from 'mongoose';

export async function createRecord<T>( {
	model,
	data
}: {
  model: Model<T>;
  data: Partial<T>;
} ): Promise<T> {
	const result = new model( data );
	await result.save();
	return result.toObject();
}
