import { logToSlack } from './logtoslack.function';
import { SlackAuth } from '../types';

export async function sendSlackMessage( message: string, auth: SlackAuth ): Promise<void> {
	try {
		await logToSlack( message, auth );
		console.log( 'Slack message sent' );
	} catch ( error: unknown ) {
		console.error( 'The system failed to send Slack message:', error );
	}
}

