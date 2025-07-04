import {
	AuthHookUser,
	AuthModuleOptions,
	VerificationToken
} from '@super-skeleton/auth';
import {
	Email,
	EmailContact,
	EmailDependencyCreds,
	EmailProvider,
	MailgunCreds,
	sendTemplateEmailWith
} from '@super-skeleton/notifications';
import { secrets } from '../../environment';

type Secrets = typeof secrets;

// Helper function to create sender contact from app secrets
function createSender( appSecrets: Secrets ): EmailContact {
	return {
		email: appSecrets.email.senderAddress!,
		name: appSecrets.email.senderName || appSecrets.app.name
	};
}

// Helper function to prepare email credentials based on provider
function prepareEmailCredentials(
	appSecrets: Secrets,
	sender: EmailContact,
	logPrefix: string
): {
  credsForProvider: EmailDependencyCreds<any> | null;
  provider: EmailProvider;
} {
	const provider = appSecrets.email.provider as EmailProvider;

	switch ( provider ) {
	case EmailProvider.sendgrid:
		if ( !appSecrets.email.sendgridApiKey ) {
			console.error(
				`[${logPrefix}]: SendGrid provider selected but no API key found. Skipping email.`
			);
			return { credsForProvider: null, provider };
		}
		return {
			credsForProvider: {
				creds: appSecrets.email.sendgridApiKey,
				defaultSender: sender
			} as EmailDependencyCreds<string>,
			provider
		};

	case EmailProvider.mailgun:
		if ( !appSecrets.email.mailgunApiKey || !appSecrets.email.mailgunDomain ) {
			console.error(
				`[${logPrefix}]: Mailgun provider selected but API key or domain not found. Skipping email.`
			);
			return { credsForProvider: null, provider };
		}
		return {
			credsForProvider: {
				creds: {
					apiKey: appSecrets.email.mailgunApiKey!,
					domain: appSecrets.email.mailgunDomain!
				},
				defaultSender: sender
			} as EmailDependencyCreds<MailgunCreds>,
			provider
		};

	default:
		console.warn(
			`[${logPrefix}]: Email provider '${provider}' is configured but not supported. Email not sent.`
		);
		return { credsForProvider: null, provider };
	}
}

// Helper function to send an email with proper error handling
async function sendEmail(
	emailPayload: Email,
	credentials: {
    credsForProvider: EmailDependencyCreds<any> | null;
    provider: EmailProvider;
  },
	user: AuthHookUser,
	logPrefix: string
): Promise<void> {
	if ( !credentials.credsForProvider ) {
		return;
	}

	try {
		await sendTemplateEmailWith( {
			provider: credentials.provider,
			creds: credentials.credsForProvider,
			payload: emailPayload
		} );

		console.log(
			`[${logPrefix}]: Email sent to ${user.email} via ${credentials.provider}.`
		);
	} catch ( error ) {
		console.error(
			`[${logPrefix}]: Failed to send email to ${user.email}. Error: ${
				error instanceof Error ? error.message : String( error )
			}`,
			error
		);
	}
}

export function configureAuthModuleOptions(
	appSecrets: Secrets
): AuthModuleOptions {
	const authModuleOptions: AuthModuleOptions = {
		jwtSecret: appSecrets.auth.jwtSecret!,
		refreshJwtSecret: appSecrets.auth.refreshJwtSecret!,
		hooks: {
			onUserSignUp: async (
				user: AuthHookUser,
				verificationToken?: VerificationToken
			) => {
				const logPrefix = 'Auth Hook - User SignUp';
				console.log(
					`[${logPrefix}]: User ${user.email} registered. Verification token: ${verificationToken}`
				);

				if ( !verificationToken ) {
					console.warn(
						`[${logPrefix}]: No verification token provided for ${user.email}. Skipping email sending.`
					);
					return;
				}

				// Early return if email configuration is missing
				if (
					!appSecrets.email.provider ||
          !appSecrets.email.senderAddress ||
          !appSecrets.app.apiBaseUrl
				) {
					console.log(
						`[${logPrefix}]: Email provider not configured. Skipping verification email.`
					);
					return;
				}

				const verificationLink = `${appSecrets.app.apiBaseUrl}/auth/verify-email/${verificationToken}`;
				const sender = createSender( appSecrets );

				const emailPayload: Email = {
					to: {
						email: user.email,
						name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email
					},
					from: sender,
					subject: `Verify Your Email Address - ${appSecrets.app.name}`,
					rawHtml: `
						<p>Hello ${user.firstName || 'User'},</p>
						<p>Thank you for registering at ${appSecrets.app.name}. Please verify your email address by clicking the link below:</p>
						<p><a href="${verificationLink}">Verify Email</a></p>
						<p>This link will expire in 24 hours.</p>
						<p>If you did not create an account using this email address, please ignore this email.</p>
						<p>Thanks,<br/>The ${appSecrets.app.name} Team</p>
					`
				};

				const credentials = prepareEmailCredentials(
					appSecrets,
					sender,
					logPrefix
				);
				await sendEmail( emailPayload, credentials, user, logPrefix );
			},
			onUserLogin: ( user: AuthHookUser, details: { method: string } ) => {
				console.log(
					`[Auth Hook - User Login]: User ${user.email} (ID: ${user._id}) logged in via ${details.method}.`
				);
			},
			onPasswordResetRequested: async (
				user: AuthHookUser,
				passwordResetToken: string
			) => {
				const logPrefix = 'Auth Hook - Password Reset';
				console.log(
					`[${logPrefix}]: User ${user.email} requested a password reset. Token: ${passwordResetToken}`
				);

				// Early return if email configuration is missing
				if (
					!appSecrets.email.provider ||
          !appSecrets.email.senderAddress ||
          !appSecrets.app.frontendAppUrl
				) {
					console.log(
						`[${logPrefix}]: Email provider not configured. Skipping password reset email.`
					);
					return;
				}

				const resetLink = `${appSecrets.app.frontendAppUrl}/reset-password?token=${passwordResetToken}`;
				const sender = createSender( appSecrets );

				const emailPayload: Email = {
					to: {
						email: user.email,
						name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email
					},
					from: sender,
					subject: `Password Reset Request - ${appSecrets.app.name}`,
					rawHtml: `
						<p>Hello ${user.firstName || 'User'},</p>
						<p>We received a request to reset your password for your account at ${appSecrets.app.name}.</p>
						<p>If you requested this reset, please click the link below to set a new password:</p>
						<p><a href="${resetLink}">Reset Password</a></p>
						<p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
						<p>Thanks,<br/>The ${appSecrets.app.name} Team</p>
					`
				};

				const credentials = prepareEmailCredentials(
					appSecrets,
					sender,
					logPrefix
				);
				await sendEmail( emailPayload, credentials, user, logPrefix );
			},
			onPasswordResetCompleted: async ( user: AuthHookUser ) => {
				const logPrefix = 'Auth Hook - Password Reset Completed';
				console.log(
					`[${logPrefix}]: Password for user ${user.email} has been reset.`
				);

				// Early return if email configuration is missing
				if ( !appSecrets.email.provider || !appSecrets.email.senderAddress ) {
					console.log(
						`[${logPrefix}]: Email provider not configured. Skipping confirmation email.`
					);
					return;
				}

				const sender = createSender( appSecrets );

				const emailPayload: Email = {
					to: {
						email: user.email,
						name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email
					},
					from: sender,
					subject: `Your Password Has Been Changed - ${appSecrets.app.name}`,
					rawHtml: `
						<p>Hello ${user.firstName || 'User'},</p>
						<p>This email confirms that the password for your account at ${appSecrets.app.name} associated with this email address (${user.email}) was recently changed.</p>
						<p>If you made this change, you don't need to do anything.</p>
						<p>If you did NOT make this change, please contact our support team immediately so we can help secure your account.</p>
						<p>Thanks,<br/>The ${appSecrets.app.name} Team</p>
					`
				};

				const credentials = prepareEmailCredentials(
					appSecrets,
					sender,
					logPrefix
				);
				await sendEmail( emailPayload, credentials, user, logPrefix );
			},
			onVerificationEmailResent: async (
				user: AuthHookUser,
				verificationToken?: VerificationToken
			) => {
				const logPrefix = 'Auth Hook - Verification Email Resent';
				console.log(
					`[${logPrefix}]: New verification email requested for ${user.email}. Token: ${verificationToken}`
				);

				if ( !verificationToken ) {
					console.warn(
						`[${logPrefix}]: No new verification token provided for ${user.email}. Skipping email sending.`
					);
					return;
				}

				// Early return if email configuration is missing
				if (
					!appSecrets.email.provider ||
          !appSecrets.email.senderAddress ||
          !appSecrets.app.apiBaseUrl
				) {
					console.log(
						`[${logPrefix}]: Email provider not configured. Skipping new verification email.`
					);
					return;
				}

				const verificationLink = `${appSecrets.app.apiBaseUrl}/auth/verify-email/${verificationToken}`;
				const sender = createSender( appSecrets );

				const emailPayload: Email = {
					to: {
						email: user.email,
						name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email
					},
					from: sender,
					subject: `Verify Your Email Address - ${appSecrets.app.name} (Resend)`,
					rawHtml: `
						<p>Hello ${user.firstName || 'User'},</p>
						<p>You requested to resend the verification email for your account at ${appSecrets.app.name}. Please verify your email address by clicking the link below:</p>
						<p><a href="${verificationLink}">Verify Email</a></p>
						<p>This link will expire in 24 hours.</p>
						<p>If you did not request this, please ignore this email.</p>
						<p>Thanks,<br/>The ${appSecrets.app.name} Team</p>
					`
				};

				const credentials = prepareEmailCredentials(
					appSecrets,
					sender,
					logPrefix
				);
				await sendEmail( emailPayload, credentials, user, logPrefix );
			}
		},
		requireEmailVerificationForLogin:
      appSecrets.auth.requireEmailVerificationForLogin
	};

	if (
		appSecrets.auth.googleClientId &&
    appSecrets.auth.googleClientSecret &&
    appSecrets.auth.googleOAuthRedirectUri &&
    appSecrets.app.googleOAuthSuccessRedirectUrl &&
    appSecrets.app.googleOAuthFailureRedirectUrl
	) {
		authModuleOptions.googleOAuth = {
			clientId: appSecrets.auth.googleClientId,
			clientSecret: appSecrets.auth.googleClientSecret,
			redirectUri: appSecrets.auth.googleOAuthRedirectUri,
			successRedirectUrl: appSecrets.app.googleOAuthSuccessRedirectUrl,
			failureRedirectUrl: appSecrets.app.googleOAuthFailureRedirectUrl
		};
	}

	return authModuleOptions;
}
