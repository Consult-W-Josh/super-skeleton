import { Model } from 'mongoose';
import { isMongooseModel, validateDbOp } from './helpers';
import { crudErrors } from '../../constants';
import {
	Data,
	DbOp,
	DbOpReturnType,
	Query,
	UseDbConfigType
} from '../../types';

import {
	createRecord,
	findRecord,
	findRecords,
	updateRecord,
	updateRecords
} from './sub-functions';

export async function useDb<T, Op extends DbOp>( {
	op,
	model,
	config
}: {
  op: Op;
  model: Model<T>;
  config: UseDbConfigType<T>[Op];
} ): Promise<DbOpReturnType<T>[Op]> {
	if ( !isMongooseModel( model ) ) {
		throw new Error( crudErrors.invalidModel );
	}
	validateDbOp[op]( config );

	const operations = {
		[DbOp.c]: createRecord,
		[DbOp.r]: findRecord,
		[DbOp.l]: findRecords,
		[DbOp.u]: updateRecord,
		[DbOp.um]: updateRecords
	};

	return operations[op]<T>( {
		model,
		query: ( config as Query<T> ).query,
		data: ( config as Data<T> ).data
	} ) as DbOpReturnType<T>[Op];
}
