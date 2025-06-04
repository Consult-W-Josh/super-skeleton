import { Schema, SchemaDefinition } from 'mongoose';
import { crudErrors, md } from '../../constants';
import { SsOrms, SsSchema } from '../../types';
import { createMongooseSchema } from './mongoose';

const ormSchemaMap = {
	[SsOrms.mongoose]: md
};

export function createSchema<T>(
	sch: SsSchema<T>,
	orm: SsOrms = SsOrms.mongoose
): Schema<T> {
	if ( orm === SsOrms.mongoose ) {
		const schDef: SchemaDefinition<T> = {} as SchemaDefinition<T>;
		Object.keys( sch ).forEach( ( key ) => {
			const ssFieldDefinition = sch[key];
			const fieldTypeKey = ssFieldDefinition.type as string;

			const mongooseTypeGenerator = md[fieldTypeKey];

			if ( !mongooseTypeGenerator ) {
				console.error(
					`[SuperSkeleton CRUDSchema] No Mongoose base type definition found in model-defaults for SsSchemaFieldType: '${fieldTypeKey}' on field: '${key}'. Ensure this type is defined in 'model-defaults.constants.ts'.`
				);
				throw new Error(
					`CRUD_ERROR_MISSING_MODEL_DEFAULT: SsSchemaFieldType '${fieldTypeKey}' for field '${key}' is not defined in model-defaults.`
				);
			}

			let baseDefinition;
			if ( typeof mongooseTypeGenerator === 'function' ) {
				if (
					fieldTypeKey === 'RequiredObjectIdWithRef' ||
          fieldTypeKey === 'ObjectIdWithRef'
				) {
					baseDefinition = mongooseTypeGenerator(
						ssFieldDefinition.extend?.['ref']
					);
				} else if (
					fieldTypeKey === 'RequiredEnum' ||
          fieldTypeKey === 'OptionalEnum' ||
          fieldTypeKey === 'RequiredEnumWithDefault'
				) {
					baseDefinition = mongooseTypeGenerator(
						ssFieldDefinition.extend?.['enum']
					);
					if ( fieldTypeKey === 'RequiredEnumWithDefault' ) {
						baseDefinition = mongooseTypeGenerator(
							ssFieldDefinition.extend?.['enum'],
							ssFieldDefinition.extend?.['default']
						);
					}
				} else if (
					fieldTypeKey === 'RequiredStringWithDefault' ||
          fieldTypeKey === 'RequiredNumberWithDefault'
				) {
					baseDefinition = mongooseTypeGenerator(
						ssFieldDefinition.extend?.['default']
					);
				} else if (
					fieldTypeKey === 'OptionalSchema' ||
          fieldTypeKey === 'RequiredSchema'
				) {
					baseDefinition = mongooseTypeGenerator(
						ssFieldDefinition.extend?.['schema']
					);
				} else {
					baseDefinition = mongooseTypeGenerator();
				}
			} else {
				baseDefinition = { ...mongooseTypeGenerator };
			}

			const {
				ref,
				enum: enumObj,
				default: defaultValue,
				schema,
				...otherExtendProps
			} = ssFieldDefinition.extend || {};
			schDef[key] = { ...baseDefinition, ...otherExtendProps };
		} );

		return createMongooseSchema<T>( schDef );
	}

	throw new Error( crudErrors.invalidOrm );
}
