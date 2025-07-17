export type EmailContact = {
  email: string;
  name?: string;
};

type EmailBase = {
  from?: EmailContact;
  to: EmailContact;
  subject?: string;
  data?: Record<string, string>;
};

type EmailWithTemplate = EmailBase & {
  template: string;
  rawHtml?: never;
};

type EmailWithRawHtml = EmailBase & {
  rawHtml: string;
  template?: never;
};

export type Email = EmailWithTemplate | EmailWithRawHtml;

export type EmailDependencyCreds<Creds> = {
  creds: Creds;
  defaultSender?: EmailContact;
  defaultTemplate?: string;
};

export abstract class EmailDependency<Creds = unknown> {
	protected creds: Creds;
	protected defaultSender?: EmailContact;
	protected defaultTemplate?: string;

	protected constructor( {
		creds,
		defaultSender,
		defaultTemplate
	}: EmailDependencyCreds<Creds> ) {
		this.creds = creds;
		this.defaultSender = defaultSender;
		this.defaultTemplate = defaultTemplate;
	}

	async send( email: Email ) {
		this.validatePayload( email );
		return this.sendEmail( email );
	}

  protected abstract sendEmail( email: Email ): Promise<unknown>;

  protected getSender( email: Email ) {
  	return email.from ?? this.defaultSender;
  }

  protected getTemplate( email: Email ) {
  	return email.template ?? this.defaultTemplate;
  }

  protected validatePayload( email: Email ) {
  	if ( !email.template && !email.rawHtml && !this.defaultTemplate ) {
  		throw new Error( 'Email template or rawHtml must be provided' );
  	}

  	if ( !email.from && !this.defaultSender ) {
  		throw new Error( 'Email sender must be provided' );
  	}
  }
}
