import { EventEmitter } from 'events';

export class BaseEventEmitterService {
	protected eventEmitter: EventEmitter;

	constructor() {
		this.eventEmitter = new EventEmitter();
	}

	public on( eventName: string, listener: ( ...args: any[] ) => void ): void {
		this.eventEmitter.on( eventName, listener );
	}

	public emit( eventName: string, ...args: any[] ): boolean {
		return this.eventEmitter.emit( eventName, ...args );
	}

	public off( eventName: string, listener: ( ...args: any[] ) => void ): void {
		this.eventEmitter.off( eventName, listener );
	}

	public once( eventName: string, listener: ( ...args: any[] ) => void ): void {
		this.eventEmitter.once( eventName, listener );
	}
}
