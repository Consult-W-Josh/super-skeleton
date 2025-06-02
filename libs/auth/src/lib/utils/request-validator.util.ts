import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

interface RequestValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export function validateRequestParts( schemas: RequestValidationSchemas ) {
	return async ( req: Request, res: Response, next: NextFunction ) => {
		try {
			if ( schemas.params ) {
				req.params = await schemas.params.parseAsync( req.params );
			}
			if ( schemas.query ) {
				req.query = await schemas.query.parseAsync( req.query );
			}
			if ( schemas.body ) {
				req.body = await schemas.body.parseAsync( req.body );
			}
			next();
		} catch ( error ) {
			if ( error instanceof z.ZodError ) {
				return res.status( 400 ).json( {
					message: 'Validation failed',
					errors: error.errors,
				} );
			}
			next( error );
		}
	};
}
