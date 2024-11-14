import { model, Model, Schema, SchemaDefinition } from 'mongoose';
import { createMongooseSchema } from './create-mongoose-schema.function';

export function createMongooseModel<T, Methods = unknown>(
	definition: SchemaDefinition<T>,
	collectionName: string,
	methods = undefined
): {
  model: Model<T, unknown, Methods>;
  schema: Schema<T>;
} {
	const sch = createMongooseSchema( definition, methods );
	return {
		model: model<T, Model<T, unknown, Methods>>( collectionName, sch ),
		schema: sch
	};
}

export function createMongooseModelFromSchema<T, Methods = unknown>(
	sch: Schema<T>,
	collectionName: string
): {
  model: Model<T, unknown, Methods>;
  schema: Schema<T>;
} {
	return {
		model: model<T, Model<T, unknown, Methods>>( collectionName, sch ),
		schema: sch
	};
}
