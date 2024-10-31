import { constructSuperSkeletonExpressApp } from "@super-skeleton/app";
import { secrets } from "./environment";

const port = 4212;

const app = constructSuperSkeletonExpressApp( {
	mongoDbUrl: secrets.mongoDbUrl
} );

app.get( '/', ( req, res ) => {
	res.send( { message: 'Hello API' } );
} );

app.listen( port, () => {
	console.log( `[ ready ]: ${port}` );
} );
