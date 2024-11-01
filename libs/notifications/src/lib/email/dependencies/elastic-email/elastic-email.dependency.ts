import {
	Configuration,
	EmailsApi,
	EmailTransactionalMessageData
} from '@elasticemail/elasticemail-client-ts-axios';
import { Email, EmailDependency, EmailDependencyCreds } from '../../types';

export class ElasticEmailDependency extends EmailDependency<string> {
	private readonly emailApi: EmailsApi;

	constructor( depCreds: EmailDependencyCreds<string> ) {
		super( depCreds );
		this.emailApi = new EmailsApi( new Configuration( { apiKey: this.creds } ) );
	}

	protected async sendEmail( payload: Email ): Promise<unknown> {
		const sender = this.getSender( payload );
		const emailPayload: EmailTransactionalMessageData = {
			Recipients: {
				To: [payload.to.email]
			},
			Content: {
				TemplateName: this.getTemplate( payload ),
				Merge: payload.data,
				From: `${sender.name}<${sender.email}>`,
				Subject: payload.subject
			}
		};
		return this.emailApi.emailsTransactionalPost( emailPayload );
	}
}
