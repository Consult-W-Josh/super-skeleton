import { EmailProvider } from '@super-skeleton/notifications';

export const secrets = {
	mongoDbUrl: process.env.DB_URL,
	jwtSecret: process.env.AUTH_JWT_SECRET,
	refreshJwtSecret: process.env.AUTH_REFRESH_JWT_SECRET,
	requireEmailVerificationForLogin: process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false',
	emailProvider: process.env.EMAIL_PROVIDER as EmailProvider | undefined,
	sendgridApiKey: process.env.SENDGRID_API_KEY,
	mailgunApiKey: process.env.MAILGUN_API_KEY,
	mailgunDomain: process.env.MAILGUN_DOMAIN,
	emailSenderAddress: process.env.EMAIL_SENDER_ADDRESS,
	emailSenderName: process.env.EMAIL_SENDER_NAME,
	apiBaseUrl: process.env.API_BASE_URL,
	appName: process.env.APP_NAME || 'My Super App'
};
