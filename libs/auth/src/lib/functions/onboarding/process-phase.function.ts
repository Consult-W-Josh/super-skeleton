import { DbOp, ssCrud, SsModel } from "@super-skeleton/crud";
import { ZodError, ZodSchema } from "zod";

interface FieldConfig {
    optional?: boolean;
    validationMessage?: string;
	unique?: boolean;
	encrypt?: boolean;
}

type OnboardingDataConfig<T> = {
	fields?: {
		[k in keyof T]?: FieldConfig
	}
	isFirst?: boolean;
}

type OnboardingPhase<User> = {
	requirements?: Partial<User>;
	data: Partial<User>;
	schema: {
		zod: ZodSchema<User>,
		model: SsModel<User>
	}
	config?: OnboardingDataConfig<User>;
}

export function processOnboardingPhase<User>( 
	{ data, schema: { zod, model }, config }: OnboardingPhase<User>
) {
	try {
		const parsed = zod.parse( data );
		ssCrud.useDb( {
			op: DbOp.c,
			model,
			config: {
				data: parsed
			}
		} );
	} catch ( e ) {
		if ( e instanceof ZodError ) {
			throw { message: 'Validation failed', errors: e.errors };
		}
	}
}

export function index(): string {
	return 'index';
}
