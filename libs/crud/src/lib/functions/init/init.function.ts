import { connect, connection, ConnectOptions, disconnect } from 'mongoose';

export async function init( uri: string, connectOptions?: ConnectOptions ) {
	if ( !connection.readyState ) {
		if ( !connectOptions ) {
			connectOptions = {
				authSource: 'admin',
				retryWrites: true
			};
		}
		await connect( uri, connectOptions );
		console.log( 'Connected to MongoDB' );
	}
}

export async function close() {
	return disconnect();
}
