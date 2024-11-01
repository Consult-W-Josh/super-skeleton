import { Email, EmailDependency, EmailDependencyCreds } from '../../types';
import { Sendim } from 'sendim';
import { SendimBrevoProvider, SendimBrevoProviderConfig } from 'sendim-brevo';

export class BrevoDependency extends EmailDependency<string> {
	protected sendim = new Sendim();

	constructor( depCreds: EmailDependencyCreds<string> ) {
		super( depCreds );
	}

	protected async sendEmail( payload: Email ): Promise<unknown> {
		await this.sendim.addTransport<SendimBrevoProviderConfig>(
			SendimBrevoProvider,
			{
				apiKey: this.creds
			}
		);

		return this.sendim.sendTransactionalMail( {
			templateId: payload.template,
			to: [{ email: payload.to.email, name: payload.to.name }],
			sender: this.getSender( payload ),
			params: payload.data
		} );
	}
}
