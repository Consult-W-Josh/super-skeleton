import { EmailDependencyCreds } from './email-dependency.interface';

export enum EmailProvider {
  brevo = 'brevo',
  elasticEmail = 'elasticEmail',
  sendgrid = 'sendgrid',
  mailgun = 'mailgun'
}

export type MailgunCreds = {
  apiKey: string;
  domain: string;
};

export type EmailProviderCredType = {
  [EmailProvider.brevo]: EmailDependencyCreds<string>;
  [EmailProvider.elasticEmail]: EmailDependencyCreds<string>;
  [EmailProvider.sendgrid]: EmailDependencyCreds<string>;
  [EmailProvider.mailgun]: EmailDependencyCreds<MailgunCreds>;
};

export type EmailProviderCreds = EmailDependencyCreds<string | MailgunCreds>;
