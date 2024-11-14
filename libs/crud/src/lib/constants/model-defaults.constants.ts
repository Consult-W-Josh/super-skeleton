import { SchemaDefinition, SchemaDefinitionProperty, Types } from 'mongoose';
import { SsOrmRepository, SsSchemaFieldTypes } from '../types';

const RequiredString: SchemaDefinitionProperty = {
	type: String,
	required: true,
};

const RequiredObjectId: SchemaDefinitionProperty = {
	type: Types.ObjectId,
	required: true,
};

const RequiredObjectIdWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: Types.ObjectId,
		required: true,
		ref,
	};
};

const ObjectIdWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: Types.ObjectId,
		ref,
	};
};

const OptionalSchema = <T>( sch: SchemaDefinition<T> ): SchemaDefinitionProperty => {
	return {
		type: sch,
		required: false,
	};
};

const RequiredSchema = <T>( sch: SchemaDefinition<T> ): SchemaDefinitionProperty => {
	return {
		type: sch,
	};
};

const RequiredObjectIdArray: SchemaDefinitionProperty = {
	type: [Types.ObjectId],
	required: true,
};

const RequiredObjectIdArrayWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: [Types.ObjectId],
		required: true,
		ref,
	};
};

const ObjectIdArrayWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: [Types.ObjectId],
		ref,
	};
};

const RequiredBoolean: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
};

const RequiredBooleanDefaultFalse: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
	default: false,
};

const RequiredBooleanDefaultTrue: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
	default: true,
};

const RequiredNumber: SchemaDefinitionProperty<number> = {
	type: Number,
	required: true,
};

const UniqueRequiredString: SchemaDefinitionProperty = {
	type: String,
	required: true,
	unique: true,
};

const RequiredObjectArray: SchemaDefinitionProperty = {
	type: [Object],
	required: true,
};

const ObjectArray: SchemaDefinitionProperty = {
	type: [Object],
	required: false,
};

const RequiredObject: SchemaDefinitionProperty = {
	type: Object,
	required: true,
};

const RequiredDate: SchemaDefinitionProperty = {
	type: Date,
	required: true,
};

const RequiredEnum = <T>( e ): SchemaDefinitionProperty<T> => {
	return {
		type: String,
		enum: Object.values( e ),
		required: true,
	} as unknown as SchemaDefinitionProperty<T>;
};

const RequiredStringWithDefault = <T>(
	defaultValue: string,
	extras?: Partial<SchemaDefinitionProperty<T>>
): SchemaDefinitionProperty<T> => {
	return {
		type: String,
		required: true,
		default: defaultValue,
		...extras
	} as unknown as SchemaDefinitionProperty<T>;
};

export const md: SsOrmRepository<SchemaDefinitionProperty> = {
	RequiredString,
	RequiredObjectId,
	RequiredObjectIdWithRef,
	ObjectIdWithRef,
	OptionalSchema,
	RequiredSchema,
	RequiredObjectIdArray,
	RequiredObjectIdArrayWithRef,
	ObjectIdArrayWithRef,
	RequiredBoolean,
	RequiredBooleanDefaultFalse,
	RequiredBooleanDefaultTrue,
	RequiredNumber,
	UniqueRequiredString,
	RequiredObjectArray,
	ObjectArray,
	RequiredObject,
	RequiredDate,
	RequiredEnum,
	RequiredStringWithDefault
};
