import { validateDbOp } from './helpers';
import { crudErrors } from '../../constants';
import {
	Data,
	DbOp,
	DbOpReturnType,
	Query,
	SsModel,
	SsOrms,
	UseDbConfigType
} from '../../types';

import {
	createRecord,
	findRecord,
	findRecords,
	updateRecord,
	updateRecords
} from './sub-functions';
import { Model, models } from 'mongoose';
import { createModel } from '../create-model';

export async function useDb<T, Op extends DbOp>( {
	op,
	model,
	config
}: {
  op: Op;
  model: SsModel<T>;
  config: UseDbConfigType<T>[Op];
} ): Promise<DbOpReturnType<T>[Op]> {
	if ( model.orm === SsOrms.mongoose ) {
		validateDbOp[op]( config );

		const operations = {
			[DbOp.c]: createRecord,
			[DbOp.r]: findRecord,
			[DbOp.l]: findRecords,
			[DbOp.u]: updateRecord,
			[DbOp.um]: updateRecords
		};

		let mongooseModel: Model<T> = models[model.name];
		if ( !mongooseModel ) mongooseModel = createModel( model );
		
		return operations[op]<T>( {
			model: mongooseModel,
			query: ( config as Query<T> ).query,
			data: ( config as Data<T> ).data
		} ) as DbOpReturnType<T>[Op];
	}

	throw new Error( crudErrors.invalidModel );
}
