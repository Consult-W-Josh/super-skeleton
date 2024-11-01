import * as sendgrid from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';
import { Email, EmailDependency, EmailDependencyCreds } from '../../types';

export class SendgridDependency extends EmailDependency<string> {
	constructor( depCreds: EmailDependencyCreds<string> ) {
		super( depCreds );
		sendgrid.setApiKey( this.creds );
	}

	protected async sendEmail( payload: Email ): Promise<unknown> {
		const sender = this.getSender( payload );
		const emailPayload: MailDataRequired = {
			from: {
				email: sender.email,
				name: sender.name
			},
			to: payload.to.email,
			subject: payload.subject,
			templateId: this.getTemplate( payload )
		};
		return sendgrid.send( emailPayload );
	}
}
