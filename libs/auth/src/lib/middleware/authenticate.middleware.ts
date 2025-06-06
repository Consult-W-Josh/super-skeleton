import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Define a custom request type that includes the authenticated user's ID
export interface RequestWithUser extends Request {
  user?: {
    userId: string;
  };
}

/**
 * Creates an Express middleware for authenticating requests using a JWT.
 * It verifies the token from the Authorization header and attaches the user ID to the request.
 * @param jwtSecret The secret key used to verify the JWT signature.
 * @returns An Express middleware function.
 */
export function createAuthenticateJwtMiddleware( jwtSecret: string ) {
	return ( req: RequestWithUser, res: Response, next: NextFunction ) => {
		const authHeader = req.headers.authorization;

		if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) ) {
			return res.status( 401 ).json( {
				message: 'Unauthorized: Missing or improperly formatted token.'
			} );
		}

		const token = authHeader.split( ' ' )[1];

		try {
			// Verify the token and cast the payload to what we expect
			const payload = jwt.verify( token, jwtSecret ) as {
        userId: string;
        type?: string;
      };

			// Check if the token is an access token
			if ( payload.type !== 'access' ) {
				return res
					.status( 401 )
					.json( { message: 'Unauthorized: Invalid token type.' } );
			}

			// Attach user information to the request object
			req.user = {
				userId: payload.userId
			};

			next();
		} catch ( error ) {
			if ( error instanceof jwt.TokenExpiredError ) {
				return res
					.status( 401 )
					.json( { message: 'Unauthorized: Token has expired.' } );
			}
			if ( error instanceof jwt.JsonWebTokenError ) {
				return res
					.status( 401 )
					.json( { message: 'Unauthorized: Invalid token.' } );
			}
			// For other unexpected errors
			return res
				.status( 500 )
				.json( { message: 'An internal error occurred.' } );
		}
	};
} 