export enum SsOrms {
    mongoose = 'mongoose'
}

export enum SsSchemaFieldTypes {
    RequiredString = "RequiredString",
    RequiredObjectId = "RequiredObjectId",
    RequiredObjectIdWithRef = "RequiredObjectIdWithRef",
    ObjectIdWithRef = "ObjectIdWithRef",
    OptionalSchema = "OptionalSchema",
    RequiredSchema = "RequiredSchema",
    RequiredObjectIdArray = "RequiredObjectIdArray",
    RequiredObjectIdArrayWithRef = "RequiredObjectIdArrayWithRef",
    ObjectIdArrayWithRef = "ObjectIdArrayWithRef",
    RequiredBoolean = "RequiredBoolean",
    RequiredBooleanDefaultFalse = "RequiredBooleanDefaultFalse",
    RequiredBooleanDefaultTrue = "RequiredBooleanDefaultTrue",
    RequiredNumber = "RequiredNumber",
    UniqueRequiredString = "UniqueRequiredString",
    RequiredObjectArray = "RequiredObjectArray",
    ObjectArray = "ObjectArray",
    RequiredObject = "RequiredObject",
    RequiredDate = "RequiredDate",
    RequiredEnum = "RequiredEnum",
    OptionalEnum = "OptionalEnum",
    RequiredStringWithDefault = "RequiredStringWithDefault",
    OptionalStringArray = "OptionalStringArray",
    RequiredNumberWithDefault = "RequiredNumberWithDefault",
    RequiredEnumWithDefault = "RequiredEnumWithDefault",
    OptionalNumber = "OptionalNumber"
}

export type SsSchema<T> = {
    [k in keyof T]: SsSchemaFieldTypes
}

export type SsModel<T> = {
    name: string;
    schema: SsSchema<T>;
    orm: SsOrms;
}

export type SsOrmRepository<T> = {
	[K in SsSchemaFieldTypes]: T
}

