import { Router, Handler } from 'express';
import {
	createForgotPasswordController,
	createGetCurrentUserController,
	createGoogleOAuthCallbackController,
	createGoogleOAuthInitiateController,
	createLoginController,
	createLogoutController,
	createRefreshTokenController,
	createResendVerificationEmailController,
	createResetPasswordController,
	createSignupController,
	createVerifyEmailController
} from '../controllers';
import { validateRequestParts } from '../utils';
import {
	forgotPasswordZodSchema,
	logoutZodSchema,
	refreshTokenZodSchema,
	resendVerificationEmailZodSchema,
	resetPasswordZodSchema,
	userLoginZodSchema,
	userRegistrationZodSchema
} from '../user';
import { AuthService } from '../services';

interface AuthRouterDependencies {
	authService: AuthService;
	authenticateJwt: Handler;
}

export function createAuthRouter( {
	authService,
	authenticateJwt
}: AuthRouterDependencies ): Router {
	const router = Router();

	const signupController = createSignupController( authService );
	const loginController = createLoginController( authService );
	const verifyEmailController = createVerifyEmailController( authService );
	const forgotPasswordController = createForgotPasswordController( authService );
	const resetPasswordController = createResetPasswordController( authService );
	const resendVerificationEmailController =
		createResendVerificationEmailController( authService );
	const refreshTokenController = createRefreshTokenController( authService );
	const logoutController = createLogoutController( authService );
	const getCurrentUserController = createGetCurrentUserController( authService );

	router.post(
		'/signup',
		validateRequestParts( { body: userRegistrationZodSchema } ),
		signupController
	);

	router.post(
		'/login',
		validateRequestParts( { body: userLoginZodSchema } ),
		loginController
	);

	router.get( '/verify-email/:token', verifyEmailController );

	router.post(
		'/forgot-password',
		validateRequestParts( { body: forgotPasswordZodSchema } ),
		forgotPasswordController
	);

	router.post(
		'/reset-password',
		validateRequestParts( { body: resetPasswordZodSchema } ),
		resetPasswordController
	);

	router.post(
		'/resend-verification-email',
		validateRequestParts( { body: resendVerificationEmailZodSchema } ),
		resendVerificationEmailController
	);

	router.post(
		'/refresh-token',
		validateRequestParts( { body: refreshTokenZodSchema } ),
		refreshTokenController
	);

	router.post(
		'/logout',
		validateRequestParts( { body: logoutZodSchema } ),
		logoutController
	);

	// User Profile Route
	router.get( '/me', authenticateJwt, getCurrentUserController );

	// Conditionally add Google OAuth routes
	if ( authService.googleOAuthClient ) {
		const googleOAuthInitiateController =
			createGoogleOAuthInitiateController( authService );
		const googleOAuthCallbackController =
			createGoogleOAuthCallbackController( authService );

		router.get( '/google', googleOAuthInitiateController );
		router.get( '/google/callback', googleOAuthCallbackController );
		console.log( '[AuthRouter] Google OAuth routes initialized.' );
	} else {
		console.log(
			'[AuthRouter] Google OAuth not configured, routes not initialized.'
		);
	}

	// Future routes:
	// router.get('/me', ...); // Example: Get current user

	return router;
}
