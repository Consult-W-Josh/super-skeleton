import {
	Email,
	EmailDependency,
	EmailDependencyCreds,
	MailgunCreds
} from '../../types';
import { callApi, HttpMethods } from '@super-skeleton/utils';

export class MailgunDependency extends EmailDependency<MailgunCreds> {
	constructor( depCreds: EmailDependencyCreds<MailgunCreds> ) {
		super( depCreds );
	}

	protected async sendEmail( payload: Email ): Promise<unknown> {
		const sender = this.getSender( payload );
		const emailPayload = {
			from: `${sender.name}<${sender.email}>`,
			to: payload.to.email,
			subject: payload.subject,
			template: this.getTemplate( payload ),
			'h:X-Mailgun-Variables': JSON.stringify( payload.data )
		};

		return callApi( {
			serviceUri: `https://api.mailgun.net/v3/`,
			endpoint: {
				fullPath: `${this.creds.domain}/messages`,
				path: '',
				method: HttpMethods.Post
			},
			body: emailPayload,
			headers: {
				Authorization: `Basic ${this.creds.apiKey}`
			}
		} );
	}
}
