import { model, Model, Schema, SchemaDefinition } from 'mongoose';
import { createSchema } from './create-schema.function';

export function createModel<T, Methods = unknown>(
	definition: SchemaDefinition<T>,
	collectionName: string,
	methods = undefined
): {
  model: Model<T, unknown, Methods>;
  schema: Schema<T>;
} {
	const sch = createSchema( definition, methods );
	return {
		model: model<T, Model<T, unknown, Methods>>( collectionName, sch ),
		schema: sch
	};
}

export function createModelFromSchema<T, Methods = unknown>(
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
