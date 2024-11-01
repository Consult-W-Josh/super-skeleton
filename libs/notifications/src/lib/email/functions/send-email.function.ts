import { Email, EmailProvider, EmailProviderCredType } from '../types';
import { EmailDependencies } from './get-dependency.function';

export type TemplateEmailPayload<P extends EmailProvider> = {
  provider: P;
  creds: EmailProviderCredType[P];
  payload: Email;
};

export async function sendTemplateEmailWith<P extends EmailProvider>( {
	provider,
	creds,
	payload
}: TemplateEmailPayload<P> ): Promise<unknown> {
	const dep = new EmailDependencies[provider]( creds );
	return dep.send( payload );
}
