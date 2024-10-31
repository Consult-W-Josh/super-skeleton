import { DbOp, UseDbConfig } from '../../types';
import {
	validateCreateConfig,
	validateReadConfig,
	validateUpdateConfig
} from './validators';

export const validateDbOp: {
  [key in DbOp]: ( config: UseDbConfig<unknown> ) => void;
} = {
	[DbOp.c]: ( config ) => {
		validateCreateConfig( config );
	},
	[DbOp.r]: ( config ) => {
		validateReadConfig( config );
	},
	[DbOp.l]: ( config ) => {
		validateReadConfig( config );
	},
	[DbOp.u]: ( config ) => {
		validateUpdateConfig( config );
	},
	[DbOp.um]: ( config ) => {
		validateUpdateConfig( config );
	}
};
