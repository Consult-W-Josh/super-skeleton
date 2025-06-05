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

export function configureAuthModuleOptions(
	appSecrets: Secrets
): AuthModuleOptions {
	return {
		jwtSecret: appSecrets.jwtSecret!,
		refreshJwtSecret: appSecrets.refreshJwtSecret!,
		hooks: {
			onUserSignUp: async (
				user: AuthHookUser,
				verificationToken?: VerificationToken
			) => {
				console.log(
					`[Auth Hook - User SignUp]: User ${user.email} registered. Verification token: ${verificationToken}`
				);

				if ( !verificationToken ) {
					console.warn(
						`[Auth Hook - User SignUp]: No verification token provided for ${user.email}. Skipping email sending.`
					);
					return;
				}

				if (
					appSecrets.emailProvider &&
          appSecrets.emailSenderAddress &&
          appSecrets.apiBaseUrl
				) {
					try {
						const verificationLink = `${appSecrets.apiBaseUrl}/auth/verify-email/${verificationToken}`;
						const sender: EmailContact = {
							email: appSecrets.emailSenderAddress,
							name: appSecrets.emailSenderName || appSecrets.appName
						};

						const emailPayload: Email = {
							to: {
								email: user.email,
								name:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  user.email
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
							} as EmailDependencyCreds<MailgunCreds>;
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
							`[Auth Hook - User SignUp]: Failed to send verification email to ${
								user.email
							}. Error: ${
								error instanceof Error ? error.message : String( error )
							}`,
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
			},
			onPasswordResetRequested: async (
				user: AuthHookUser,
				passwordResetToken: string
			) => {
				console.log(
					`[Auth Hook - Password Reset Requested]: User ${user.email} requested a password reset. Token: ${passwordResetToken}`
				);

				if (
					appSecrets.emailProvider &&
          appSecrets.emailSenderAddress &&
          appSecrets.frontendAppUrl
				) {
					try {
						const resetLink = `${appSecrets.frontendAppUrl}/reset-password?token=${passwordResetToken}`;
						const sender: EmailContact = {
							email: appSecrets.emailSenderAddress,
							name: appSecrets.emailSenderName || appSecrets.appName
						};

						const emailPayload: Email = {
							to: {
								email: user.email,
								name:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  user.email
							},
							from: sender,
							subject: `Password Reset Request - ${appSecrets.appName}`,
							rawHtml: `
                <p>Hello ${user.firstName || 'User'},</p>
                <p>We received a request to reset your password for your account at ${appSecrets.appName}.</p>
                <p>If you requested this reset, please click the link below to set a new password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
                <p>Thanks,<br/>The ${appSecrets.appName} Team</p>
              `
						};

						let credsForProvider;
						switch ( appSecrets.emailProvider ) {
						case EmailProvider.sendgrid:
							if ( !appSecrets.sendgridApiKey ) {
								console.error(
									'[Auth Hook - Password Reset]: SendGrid provider selected but no API key found. Skipping email.'
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
								`[Auth Hook - Password Reset]: Password reset email sent to ${user.email} via SendGrid.`
							);
							break;
						case EmailProvider.mailgun:
							if ( !appSecrets.mailgunApiKey || !appSecrets.mailgunDomain ) {
								console.error(
									'[Auth Hook - Password Reset]: Mailgun provider selected but API key or domain not found. Skipping email.'
								);
								return;
							}
							credsForProvider = {
								creds: {
									apiKey: appSecrets.mailgunApiKey!,
									domain: appSecrets.mailgunDomain!
								},
								defaultSender: sender
							} as EmailDependencyCreds<MailgunCreds>;
							await sendTemplateEmailWith( {
								provider: EmailProvider.mailgun,
								creds: credsForProvider,
								payload: emailPayload
							} );
							console.log(
								`[Auth Hook - Password Reset]: Password reset email sent to ${user.email} via Mailgun.`
							);
							break;
						default:
							console.warn(
								`[Auth Hook - Password Reset]: Email provider '${appSecrets.emailProvider}' is configured but not supported. Email not sent.`
							);
						}
					} catch ( error ) {
						console.error(
							`[Auth Hook - Password Reset]: Failed to send password reset email to ${
								user.email
							}. Error: ${
								error instanceof Error ? error.message : String( error )
							}`,
							error
						);
					}
				} else {
					console.log(
						'[Auth Hook - Password Reset]: Email provider not configured. Skipping password reset email.'
					);
				}
			},
			onPasswordResetCompleted: async ( user: AuthHookUser ) => {
				console.log(
					`[Auth Hook - Password Reset Completed]: Password for user ${user.email} has been reset.`
				);

				if ( appSecrets.emailProvider && appSecrets.emailSenderAddress ) {
					try {
						const sender: EmailContact = {
							email: appSecrets.emailSenderAddress,
							name: appSecrets.emailSenderName || appSecrets.appName
						};

						const emailPayload: Email = {
							to: {
								email: user.email,
								name:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  user.email
							},
							from: sender,
							subject: `Your Password Has Been Changed - ${appSecrets.appName}`,
							rawHtml: `
                <p>Hello ${user.firstName || 'User'},</p>
                <p>This email confirms that the password for your account at ${appSecrets.appName} associated with this email address (${user.email}) was recently changed.</p>
                <p>If you made this change, you don't need to do anything.</p>
                <p>If you did NOT make this change, please contact our support team immediately so we can help secure your account.</p>
                <p>Thanks,<br/>The ${appSecrets.appName} Team</p>
              `
						};

						let credsForProvider;
						switch ( appSecrets.emailProvider ) {
						case EmailProvider.sendgrid:
							if ( !appSecrets.sendgridApiKey ) {
								console.error(
									'[Auth Hook - Password Reset Completed]: SendGrid provider selected but no API key found. Skipping confirmation email.'
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
								`[Auth Hook - Password Reset Completed]: Password change confirmation email sent to ${user.email} via SendGrid.`
							);
							break;
						case EmailProvider.mailgun:
							if ( !appSecrets.mailgunApiKey || !appSecrets.mailgunDomain ) {
								console.error(
									'[Auth Hook - Password Reset Completed]: Mailgun provider selected but API key or domain not found. Skipping confirmation email.'
								);
								return;
							}
							credsForProvider = {
								creds: {
									apiKey: appSecrets.mailgunApiKey!,
									domain: appSecrets.mailgunDomain!
								},
								defaultSender: sender
							} as EmailDependencyCreds<MailgunCreds>;
							await sendTemplateEmailWith( {
								provider: EmailProvider.mailgun,
								creds: credsForProvider,
								payload: emailPayload
							} );
							console.log(
								`[Auth Hook - Password Reset Completed]: Password change confirmation email sent to ${user.email} via Mailgun.`
							);
							break;
						default:
							console.warn(
								`[Auth Hook - Password Reset Completed]: Email provider '${appSecrets.emailProvider}' is configured but not supported. Confirmation email not sent.`
							);
						}
					} catch ( error ) {
						console.error(
							`[Auth Hook - Password Reset Completed]: Failed to send password change confirmation email to ${
								user.email
							}. Error: ${
								error instanceof Error ? error.message : String( error )
							}`,
							error
						);
					}
				} else {
					console.log(
						'[Auth Hook - Password Reset Completed]: Email provider not configured. Skipping confirmation email.'
					);
				}
			}
		},
		requireEmailVerificationForLogin:
      appSecrets.requireEmailVerificationForLogin
	};
}
