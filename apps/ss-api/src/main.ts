import { constructSuperSkeletonExpressApp as constructApp } from '@super-skeleton/app';
import { initializeAuthModule } from '@super-skeleton/auth';
import { secrets } from './environment';
import { validateRequiredSecrets } from './app/utils/validate-env.util';
import { configureAuthModuleOptions } from './app/utils/configure-auth-module.util';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	validateRequiredSecrets( secrets );

	const app = constructApp( {
		mongoDbUrl: secrets.database.url
	} );

	app.use( cookieParser() );

	const authModuleOptions = configureAuthModuleOptions( secrets );
	const authRouter = initializeAuthModule( authModuleOptions );
	app.use( '/auth', authRouter );

	app.get( '/', ( req, res ) => {
		res.send( { message: 'Hello API' } );
	} );

	const port = process.env.PORT ?? 4212;
	const server = app.listen( port, () => {
		console.log( `🚀 Application is running on: http://localhost:${port}` );
	} );
	server.on( 'error', console.error );
}

bootstrap();
