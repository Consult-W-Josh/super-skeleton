import { EmailProvider } from '@super-skeleton/notifications';
import { secrets } from '../../environment';

type Secrets = typeof secrets;

export function validateRequiredSecrets( appSecrets: Secrets ): void {
	if ( !appSecrets.auth.jwtSecret || !appSecrets.auth.refreshJwtSecret ) {
		console.error(
			'FATAL ERROR: AUTH_JWT_SECRET and/or AUTH_REFRESH_JWT_SECRET are not defined in environment variables.'
		);
		process.exit( 1 );
	}

	// Validate email provider configuration
	if ( appSecrets.email.provider ) {
		if ( !appSecrets.email.senderAddress ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but EMAIL_SENDER_ADDRESS is not defined.'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.app.apiBaseUrl ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but API_BASE_URL is not defined (needed for verification links).'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.app.frontendAppUrl ) {
			console.error(
				'FATAL ERROR: EMAIL_PROVIDER is set, but FRONTEND_APP_URL is not defined (needed for password reset links).'
			);
			process.exit( 1 );
		}

		switch ( appSecrets.email.provider ) {
		case EmailProvider.sendgrid:
			if ( !appSecrets.email.sendgridApiKey ) {
				console.error(
					"FATAL ERROR: EMAIL_PROVIDER is set to 'sendgrid', but SENDGRID_API_KEY is not defined."
				);
				process.exit( 1 );
			}
			break;
		case EmailProvider.mailgun:
			if (
				!appSecrets.email.mailgunApiKey ||
          !appSecrets.email.mailgunDomain
			) {
				console.error(
					"FATAL ERROR: EMAIL_PROVIDER is set to 'mailgun', but MAILGUN_API_KEY or MAILGUN_DOMAIN is not defined."
				);
				process.exit( 1 );
			}
			break;
			// Add cases for other providers like Brevo, ElasticEmail if needed
		default:
			console.warn(
				`Warning: EMAIL_PROVIDER is set to '${appSecrets.email.provider}', which is not explicitly handled in validation. Ensure all necessary credentials for this provider are set.`
			);
			break;
		}
	}

	// Validate Google OAuth configuration if Client ID is present
	if ( appSecrets.auth.googleClientId ) {
		if ( !appSecrets.auth.googleClientSecret ) {
			console.error(
				'FATAL ERROR: GOOGLE_CLIENT_ID is set, but GOOGLE_CLIENT_SECRET is not defined.'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.auth.googleOAuthRedirectUri ) {
			console.error(
				'FATAL ERROR: GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_REDIRECT_URI is not defined.'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.app.googleOAuthSuccessRedirectUrl ) {
			console.error(
				'FATAL ERROR: GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_SUCCESS_REDIRECT_URL is not defined.'
			);
			process.exit( 1 );
		}
		if ( !appSecrets.app.googleOAuthFailureRedirectUrl ) {
			console.error(
				'FATAL ERROR: GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_FAILURE_REDIRECT_URL is not defined.'
			);
			process.exit( 1 );
		}
	}
}
