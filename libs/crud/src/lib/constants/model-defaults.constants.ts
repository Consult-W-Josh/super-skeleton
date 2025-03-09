import { SchemaDefinition, SchemaDefinitionProperty, Types } from 'mongoose';
import { SsOrmRepository } from '../types';

export const RequiredString: SchemaDefinitionProperty = {
	type: String,
	required: true,
};

export const RequiredObjectId: SchemaDefinitionProperty = {
	type: Types.ObjectId,
	required: true,
};

export const RequiredObjectIdWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: Types.ObjectId,
		required: true,
		ref,
	};
};

export const ObjectIdWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: Types.ObjectId,
		ref,
	};
};

export const OptionalSchema = <T>( sch: SchemaDefinition<T> ): SchemaDefinitionProperty => {
	return {
		type: sch,
		required: false,
	};
};

export const RequiredSchema = <T>( sch: SchemaDefinition<T> ): SchemaDefinitionProperty => {
	return {
		type: sch,
	};
};

export const RequiredObjectIdArray: SchemaDefinitionProperty = {
	type: [Types.ObjectId],
	required: true,
};

export const RequiredObjectIdArrayWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: [Types.ObjectId],
		required: true,
		ref,
	};
};

export const ObjectIdArrayWithRef = ( ref: string ): SchemaDefinitionProperty => {
	return {
		type: [Types.ObjectId],
		ref,
	};
};

export const RequiredBoolean: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
};

export const RequiredBooleanDefaultFalse: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
	default: false,
};

export const RequiredBooleanDefaultTrue: SchemaDefinitionProperty<boolean> = {
	type: Boolean,
	required: true,
	default: true,
};

export const RequiredNumber: SchemaDefinitionProperty<number> = {
	type: Number,
	required: true,
};

export const OptionalNumber: SchemaDefinitionProperty<number> = {
	type: Number,
	required: false,
};

export const UniqueRequiredString: SchemaDefinitionProperty = {
	type: String,
	required: true,
	unique: true,
};

export const RequiredObjectArray: SchemaDefinitionProperty = {
	type: [Object],
	required: true,
};

export const ObjectArray: SchemaDefinitionProperty = {
	type: [Object],
	required: false,
};

export const RequiredObject: SchemaDefinitionProperty = {
	type: Object,
	required: true,
};

export const RequiredDate: SchemaDefinitionProperty = {
	type: Date,
	required: true,
};

export const RequiredEnum = <T>( e ): SchemaDefinitionProperty<T> => {
	return {
		type: String,
		enum: Object.values( e ),
		required: true,
	} as unknown as SchemaDefinitionProperty<T>;
};

export const OptionalEnum = <T>( e ): SchemaDefinitionProperty<T> => {
	return {
		type: String,
		enum: Object.values( e ),
		required: false,
	} as unknown as SchemaDefinitionProperty<T>;
};

export const RequiredStringWithDefault = <T>(
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

export const OptionalStringArray: SchemaDefinitionProperty = {
	type: [String],
	required: false
};

export const RequiredNumberWithDefault = ( defaultValue: number ): SchemaDefinitionProperty<number> => {
	return {
		type: Number,
		required: true,
		default: defaultValue
	};
};

export const RequiredEnumWithDefault = <T>( e, defaultValue: string ): SchemaDefinitionProperty<T> => {
	return {
		type: String,
		enum: Object.values( e ),
		required: true,
		default: defaultValue
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
	OptionalNumber,
	UniqueRequiredString,
	RequiredObjectArray,
	ObjectArray,
	RequiredObject,
	RequiredDate,
	RequiredEnum,
	OptionalEnum,
	RequiredStringWithDefault,
	OptionalStringArray,
	RequiredNumberWithDefault,
	RequiredEnumWithDefault
};
