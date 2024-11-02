import { constructSuperSkeletonExpressApp } from '@super-skeleton/app';
import { secrets } from './environment';
import {
	EmailProvider,
	sendTemplateEmailWith
} from '@super-skeleton/notifications';

const port = 4212;

const app = constructSuperSkeletonExpressApp( {
	mongoDbUrl: secrets.mongoDbUrl
} );

app.get( '/', ( req, res ) => {
	res.send( { message: 'Hello API' } );
} );

app.get( '/mail', async ( req, res ) => {
	await sendTemplateEmailWith( {
		provider: EmailProvider.elasticEmail,
		creds: {
			creds:
        'E466B0E2865F900AB48D33D48A4884398251A6B9157EF20F320AFEBE47684B59668B2A47FE44D3767015BA2411CCB2B7'
		},
		payload: {
			to: { email: 'joshuabenseth@gmail.com', name: 'Joshua' },
			from: { email: 'sule@mailer.scalex.africa', name: 'Scalex Africa' },
			template: 'Transaction Failed'
		}
	} );
	res.status( 200 ).send( 'ok' );
} );

app.listen( port, () => {
	console.log( `[ ready ]: ${port}` );
} );
