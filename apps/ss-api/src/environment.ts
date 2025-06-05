import { EmailProvider } from '@super-skeleton/notifications';

export const secrets = {
	database: {
		url: process.env.DB_URL
	},
	auth: {
		jwtSecret: process.env.AUTH_JWT_SECRET,
		refreshJwtSecret: process.env.AUTH_REFRESH_JWT_SECRET,
		requireEmailVerificationForLogin:
      process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false'
	},
	email: {
		provider: process.env.EMAIL_PROVIDER as EmailProvider | undefined,
		sendgridApiKey: process.env.SENDGRID_API_KEY,
		mailgunApiKey: process.env.MAILGUN_API_KEY,
		mailgunDomain: process.env.MAILGUN_DOMAIN,
		senderAddress: process.env.EMAIL_SENDER_ADDRESS,
		senderName: process.env.EMAIL_SENDER_NAME
	},
	app: {
		name: process.env.APP_NAME || 'My Super App',
		apiBaseUrl: process.env.API_BASE_URL,
		frontendAppUrl: process.env.FRONTEND_APP_URL
	}
};
