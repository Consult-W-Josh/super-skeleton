import { Model } from 'mongoose';

export function isMongooseModel( model: unknown ) {
	return model instanceof Model;
}
