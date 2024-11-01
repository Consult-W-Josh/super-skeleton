import { Model } from 'mongoose';
import { isMongooseModel, validateDbOp } from './helpers';
import { crudErrors } from '../../constants';
import { DbOp, DbOpReturnType, UseDbConfig } from '../../types';

export async function useDb<T, Op extends DbOp>( {
	op,
	model,
	config
}: {
  op: Op;
  model: Model<T>;
  config: UseDbConfig<T>;
} ): Promise<DbOpReturnType<T>[Op]> {
	if ( !isMongooseModel( model ) ) {
		throw new Error( crudErrors.invalidModel );
	}
	validateDbOp[op]( config );
	return;
}
