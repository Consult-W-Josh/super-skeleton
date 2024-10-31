import express = require( 'express' );
import { urlencoded, json, NextFunction, Request, Response, Application } from 'express';
import cors = require( 'cors' );
import { catchAllErrors } from './catch-all-errors.function';
import { init } from '@super-skeleton/crud';

interface SuperSkeletonExpressAppOptions {
	mongoDbUrl?: string;
}

export function constructSuperSkeletonExpressApp( 
	{
		mongoDbUrl,
	}: SuperSkeletonExpressAppOptions
): Application {
	const app = express();

	app.use( urlencoded( {
		extended: true,
	} ) );

	app.use( json() );
	app.use( cors() );
	app.use( ( err: unknown, req: Request, res: Response, next: NextFunction ) => {
		catchAllErrors( err, req, res, next );
	} );

	if ( mongoDbUrl ){
		init( mongoDbUrl );
	}

	return app;
}
