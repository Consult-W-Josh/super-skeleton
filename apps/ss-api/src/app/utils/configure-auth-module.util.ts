import {
	AuthModuleOptions,
	AuthHookUser,
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

export function configureAuthModuleOptions(
	appSecrets: Secrets
): AuthModuleOptions {
	return {
		jwtSecret: appSecrets.jwtSecret!,
		refreshJwtSecret: appSecrets.refreshJwtSecret!,
		hooks: {
			onUserSignUp: async ( user: AuthHookUser, verificationToken?: VerificationToken ) => {
				console.log(
					`[Auth Hook - User SignUp]: User ${user.email} registered. Verification token: ${verificationToken}`
				);

				if ( !verificationToken ) {
					console.warn(
						`[Auth Hook - User SignUp]: No verification token provided for ${user.email}. Skipping email sending.`
					);
					return;
				}

				if ( appSecrets.emailProvider && appSecrets.emailSenderAddress && appSecrets.apiBaseUrl ) {
					try {
						const verificationLink = `${appSecrets.apiBaseUrl}/auth/verify-email/${verificationToken}`;
						const sender: EmailContact = {
							email: appSecrets.emailSenderAddress,
							name: appSecrets.emailSenderName || appSecrets.appName
						};

						const emailPayload: Email = {
							to: {
								email: user.email,
								name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
							},
							from: sender, // Can be overridden by defaultSender in creds
							subject: `Verify Your Email Address - ${appSecrets.appName}`,
							rawHtml: `
                <p>Hello ${user.firstName || 'User'},</p>
                <p>Thank you for registering at ${appSecrets.appName}. Please verify your email address by clicking the link below:</p>
                <p><a href="${verificationLink}">Verify Email</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not create an account using this email address, please ignore this email.</p>
                <p>Thanks,<br/>The ${appSecrets.appName} Team</p>
              `
						};

						let credsForProvider;

						switch ( appSecrets.emailProvider ) {
						case EmailProvider.sendgrid:
							if ( !appSecrets.sendgridApiKey ) {
								console.error(
									'[Auth Hook - User SignUp]: SendGrid provider selected but no API key found. Skipping email.'
								);
								return;
							}
							credsForProvider = {
								creds: appSecrets.sendgridApiKey,
								defaultSender: sender
							} as EmailDependencyCreds<string>;
							await sendTemplateEmailWith( {
								provider: EmailProvider.sendgrid,
								creds: credsForProvider,
								payload: emailPayload
							} );
							console.log(
								`[Auth Hook - User SignUp]: Verification email sent to ${user.email} via SendGrid.`
							);
							break;

						case EmailProvider.mailgun:
							if ( !appSecrets.mailgunApiKey || !appSecrets.mailgunDomain ) {
								console.error(
									'[Auth Hook - User SignUp]: Mailgun provider selected but API key or domain not found. Skipping email.'
								);
								return;
							}
							credsForProvider = {
								creds: {
									apiKey: appSecrets.mailgunApiKey!,
									domain: appSecrets.mailgunDomain!
								},
								defaultSender: sender
							} as EmailDependencyCreds<MailgunCreds>; // Corrected type assertion
							await sendTemplateEmailWith( {
								provider: EmailProvider.mailgun,
								creds: credsForProvider,
								payload: emailPayload
							} );
							console.log(
								`[Auth Hook - User SignUp]: Verification email sent to ${user.email} via Mailgun.`
							);
							break;
							// Add cases for Brevo, ElasticEmail if implementing them
						default:
							console.warn(
								`[Auth Hook - User SignUp]: Email provider '${appSecrets.emailProvider}' is configured but not supported for sending. Email not sent.`
							);
						}
					} catch ( error ) {
						console.error(
							`[Auth Hook - User SignUp]: Failed to send verification email to ${user.email}. Error: ${error instanceof Error ? error.message : String( error )}`,
							error
						);
					}
				} else {
					console.log(
						'[Auth Hook - User SignUp]: Email provider not configured. Skipping verification email.'
					);
				}
			},
			onUserLogin: ( user, details ) => {
				console.log(
					`[Auth Hook - User Login]: User ${user.email} logged in via ${details.method}.`
				);
			}
		},
		requireEmailVerificationForLogin: appSecrets.requireEmailVerificationForLogin
	};
}
