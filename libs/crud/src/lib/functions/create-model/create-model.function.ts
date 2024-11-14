import { Model } from "mongoose";
import { crudErrors } from "../../constants";
import { SsModel, SsOrms } from "../../types";
import { createSchema } from "./create-schema.function";
import { createMongooseModelFromSchema } from "./mongoose";

export function createModel<T>( model: SsModel<T> ): Model<T> {
	const schema = createSchema( model.schema, model.orm );
	if ( model.orm === SsOrms.mongoose ) {
		return createMongooseModelFromSchema<T>( schema, model.name ).model;
	}

	throw new Error( crudErrors.invalidOrm );
}