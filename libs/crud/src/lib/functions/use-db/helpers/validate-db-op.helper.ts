import { DbOp, UseDbConfig, UseDbConfigType } from '../../../types';
import {
	validateCreateConfig,
	validateReadConfig,
	validateUpdateConfig
} from './validators';

export const validateDbOp: {
  [key in DbOp]: ( config: UseDbConfigType<unknown>[key] ) => void;
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
