import { secrets } from '../../environment';

type Secrets = typeof secrets;

export function validateRequiredSecrets( appSecrets: Secrets ): void {
	if ( !appSecrets.jwtSecret || !appSecrets.refreshJwtSecret ) {
		console.error(
			'FATAL ERROR: AUTH_JWT_SECRET and/or AUTH_REFRESH_JWT_SECRET are not defined in environment variables.'
		);
		process.exit( 1 );
	}
}
