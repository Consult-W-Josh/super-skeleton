import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "axios";

export const catchAllErrors = ( e: unknown, _req: Request, res: Response, next: NextFunction ) => {
	if ( res.headersSent ) {
		return next( e );
	}
	res.status( HttpStatusCode.InternalServerError ).json( { error: 'unidentified error', e } );
};