import { EmailProvider } from '@super-skeleton/notifications';
import { secrets } from '../../environment';

type Secrets = typeof secrets;

export function validateRequiredSecrets( appSecrets: Secrets ): void {
	if ( !appSecrets.jwtSecret || !appSecrets.refreshJwtSecret ) {
		console.error(
			'FATAL ERROR: AUTH_JWT_SECRET and/or AUTH_REFRESH_JWT_SECRET are not defined in environment variables.'
		);
		process.exit( 1 );
	}

	// Validate email provider configuration
	if ( appSecrets.emailProvider ) {
		if ( !appSecrets.emailSenderAddress ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but EMAIL_SENDER_ADDRESS is not defined.'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.apiBaseUrl ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but API_BASE_URL is not defined (needed for verification links).'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.frontendAppUrl ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but FRONTEND_APP_URL is not defined (needed for password reset links).'
			);
			process.exit( 1 );
		}

		switch ( appSecrets.emailProvider ) {
		case EmailProvider.sendgrid:
			if ( !appSecrets.sendgridApiKey ) {
				console.error(
					"FATAL ERROR: EMAIL_PROVIDER is set to 'sendgrid', but SENDGRID_API_KEY is not defined."
				);
				process.exit( 1 );
			}
			break;
		case EmailProvider.mailgun:
			if ( !appSecrets.mailgunApiKey || !appSecrets.mailgunDomain ) {
				console.error(
					"FATAL ERROR: EMAIL_PROVIDER is set to 'mailgun', but MAILGUN_API_KEY or MAILGUN_DOMAIN is not defined."
				);
				process.exit( 1 );
			}
			break;
			// Add cases for other providers like Brevo, ElasticEmail if needed
		default:
			console.warn(
				`Warning: EMAIL_PROVIDER is set to '${appSecrets.emailProvider}', which is not explicitly handled in validation. Ensure all necessary credentials for this provider are set.`
			);
			break;
		}
	}
}
