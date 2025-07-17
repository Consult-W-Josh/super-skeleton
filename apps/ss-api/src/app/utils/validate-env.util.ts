import { EmailProvider } from '@super-skeleton/notifications';
import { secrets } from '../../environment';

type Secrets = typeof secrets;

// Exits the process with an error message
function exitWithError( message: string ): never {
	console.error( `FATAL ERROR: ${message}` );
	process.exit( 1 );
}

// Validates JWT authentication secrets
function validateAuthSecrets( appSecrets: Secrets ): void {
	if ( !appSecrets.auth.jwtSecret || !appSecrets.auth.refreshJwtSecret ) {
		exitWithError( 'AUTH_JWT_SECRET and/or AUTH_REFRESH_JWT_SECRET are not defined in environment variables.' );
	}
}

// Validates common email provider settings
function validateCommonEmailSettings( appSecrets: Secrets ): void {
	if ( !appSecrets.email.senderAddress ) {
		exitWithError( 'EMAIL_PROVIDER is set, but EMAIL_SENDER_ADDRESS is not defined.' );
	}

	if ( !appSecrets.app.apiBaseUrl ) {
		exitWithError( 'EMAIL_PROVIDER is set, but API_BASE_URL is not defined (needed for verification links).' );
	}

	if ( !appSecrets.app.frontendAppUrl ) {
		exitWithError( 'EMAIL_PROVIDER is set, but FRONTEND_APP_URL is not defined (needed for password reset links).' );
	}
}

// Validates provider-specific email settings
function validateEmailProviderSettings( appSecrets: Secrets ): void {
	const provider = appSecrets.email.provider;

	if ( provider === EmailProvider.sendgrid ) {
		if ( !appSecrets.email.sendgridApiKey ) {
			exitWithError( "EMAIL_PROVIDER is set to 'sendgrid', but SENDGRID_API_KEY is not defined." );
		}
		return;
	}

	if ( provider === EmailProvider.mailgun ) {
		if ( !appSecrets.email.mailgunApiKey || !appSecrets.email.mailgunDomain ) {
			exitWithError( "EMAIL_PROVIDER is set to 'mailgun', but MAILGUN_API_KEY or MAILGUN_DOMAIN is not defined." );
		}
		return;
	}

	// For other providers, just log a warning
	console.warn(
		`Warning: EMAIL_PROVIDER is set to '${provider}', which is not explicitly handled in validation. Ensure all necessary credentials for this provider are set.`
	);
}

// Validates Google OAuth configuration
function validateGoogleOAuth( appSecrets: Secrets ): void {
	if ( !appSecrets.auth.googleClientId ) {
		return; // Google OAuth not configured, skip validation
	}

	if ( !appSecrets.auth.googleClientSecret ) {
		exitWithError( 'GOOGLE_CLIENT_ID is set, but GOOGLE_CLIENT_SECRET is not defined.' );
	}

	if ( !appSecrets.auth.googleOAuthRedirectUri ) {
		exitWithError( 'GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_REDIRECT_URI is not defined.' );
	}

	if ( !appSecrets.app.googleOAuthSuccessRedirectUrl ) {
		exitWithError( 'GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_SUCCESS_REDIRECT_URL is not defined.' );
	}

	if ( !appSecrets.app.googleOAuthFailureRedirectUrl ) {
		exitWithError( 'GOOGLE_CLIENT_ID is set, but GOOGLE_OAUTH_FAILURE_REDIRECT_URL is not defined.' );
	}
}

// Main function to validate all required secrets
export function validateRequiredSecrets( appSecrets: Secrets ): void {
	validateAuthSecrets( appSecrets );

	// Validate email configuration if a provider is set
	if ( appSecrets.email.provider ) {
		validateCommonEmailSettings( appSecrets );
		validateEmailProviderSettings( appSecrets );
	}

	validateGoogleOAuth( appSecrets );
}
