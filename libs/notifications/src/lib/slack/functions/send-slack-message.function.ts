import { logToSlack } from "./logtoslack.function";
import { SlackAuth } from "../types";

export async function sendSlackMessage( message: string, auth: SlackAuth ) {
	try {
		const response = await logToSlack( message, auth );
		console.log( "Slack message sent successfully:", response );
	} catch ( error ) {
		console.error( "The system failed to send Slack message:", error );
	}
}