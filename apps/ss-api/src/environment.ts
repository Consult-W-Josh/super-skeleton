export const secrets = {
	mongoDbUrl: process.env.DB_URL,
	jwtSecret: process.env.AUTH_JWT_SECRET,
	refreshJwtSecret: process.env.AUTH_REFRESH_JWT_SECRET,
	// Default to true (verification required) unless explicitly set to 'false'
	requireEmailVerificationForLogin: process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false'
};
