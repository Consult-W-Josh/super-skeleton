// Helper function to parse expiry string like '7d', '24h', '60m' to milliseconds
export function parseExpiryToMs( expiryString: string ): number {
	const unit = expiryString.charAt( expiryString.length - 1 );
	const value = parseInt( expiryString.slice( 0, -1 ), 10 );

	if ( isNaN( value ) ) {
		throw new Error( `Invalid expiry string format: ${expiryString}` );
	}

	switch ( unit ) {
	case 'd':
		return value * 24 * 60 * 60 * 1000;
	case 'h':
		return value * 60 * 60 * 1000;
	case 'm':
		return value * 60 * 1000;
	case 's':
		return value * 1000;
	default: {
		const msValue = parseInt( expiryString, 10 );
		if ( !isNaN( msValue ) ) return msValue;
		throw new Error( `Unsupported expiry unit or format: ${expiryString}` );
	}
	}
} 