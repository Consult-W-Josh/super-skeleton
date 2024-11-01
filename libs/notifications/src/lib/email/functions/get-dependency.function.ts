import {
	BrevoDependency,
	ElasticEmailDependency,
	MailgunDependency,
	SendgridDependency
} from '../dependencies';
import {
	EmailDependency,
	EmailProvider,
	EmailProviderCredType
} from '../types';

export const EmailDependencies: {
  [P in EmailProvider]: new (
    creds: EmailProviderCredType[P]
  ) => EmailDependency;
} = {
	[EmailProvider.brevo]: BrevoDependency,
	[EmailProvider.elasticEmail]: ElasticEmailDependency,
	[EmailProvider.sendgrid]: SendgridDependency,
	[EmailProvider.mailgun]: MailgunDependency
};
