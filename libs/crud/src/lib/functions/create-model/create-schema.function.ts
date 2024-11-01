import { Schema, SchemaDefinition } from 'mongoose';

export function createSchema<T>(
	definition: SchemaDefinition<T>,
	methods = {}
): Schema<T> {
	return new Schema( definition, { timestamps: true, methods } );
}
