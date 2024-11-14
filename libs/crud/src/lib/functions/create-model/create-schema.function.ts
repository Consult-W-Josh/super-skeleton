import { Schema, SchemaDefinition } from "mongoose";
import { crudErrors, md } from "../../constants";
import { SsOrms, SsSchema } from "../../types";
import { createMongooseSchema } from "./mongoose";

const ormSchemaMap = {
	[SsOrms.mongoose]: md
};

export function createSchema<T>( sch: SsSchema<T>, orm: SsOrms = SsOrms.mongoose ): Schema<T> {
	if ( orm === SsOrms.mongoose ) {
		const schDef: SchemaDefinition<T> = {} as SchemaDefinition<T>;
		Object.keys( sch ).forEach( k => {
			schDef[k] = ormSchemaMap[orm][k];
		} );
		return createMongooseSchema<T>( schDef );
	}

	throw new Error( crudErrors.invalidOrm );
}