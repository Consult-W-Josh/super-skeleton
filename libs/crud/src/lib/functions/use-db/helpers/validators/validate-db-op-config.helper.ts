import { Data, DbOp, Query, UseDbConfig } from '../../../../types';

function validateUseDbConfig<T = unknown>( {
	prop,
	op,
	config,
	shouldExist = true
}: {
  prop: keyof UseDbConfig<T>;
  op: DbOp;
  config: UseDbConfig<T> | Query<T> | Data<T>;
  shouldExist: boolean;
} ) {
	if ( !config[prop] && shouldExist ) {
		throw new Error( `You must provide a query for a ${op} op` );
	}

	if ( config[prop] && !shouldExist ) {
		throw new Error( `You cannot have a query for a ${op} op` );
	}
}

export function validateCreateConfig<T>( config: Data<T> ) {
	validateUseDbConfig( {
		prop: 'query',
		op: DbOp.c,
		config,
		shouldExist: false
	} );

	validateUseDbConfig( {
		prop: 'data',
		op: DbOp.c,
		config,
		shouldExist: true
	} );
}

export function validateReadConfig<T>( config: Query<T> ) {
	validateUseDbConfig( {
		prop: 'query',
		op: DbOp.r,
		config,
		shouldExist: true
	} );

	validateUseDbConfig( {
		prop: 'data',
		op: DbOp.r,
		config,
		shouldExist: false
	} );
}

export function validateUpdateConfig<T>( config: UseDbConfig<T> ) {
	validateUseDbConfig( {
		prop: 'query',
		op: DbOp.u,
		config,
		shouldExist: true
	} );

	validateUseDbConfig( {
		prop: 'data',
		op: DbOp.u,
		config,
		shouldExist: true
	} );
}
