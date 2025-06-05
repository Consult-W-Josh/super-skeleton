import { Router } from 'express';
import {
	createForgotPasswordController,
	createLoginController,
	createResetPasswordController,
	createSignupController,
	createVerifyEmailController
} from '../controllers';
import { validateRequestParts } from '../utils';
import {
	forgotPasswordZodSchema,
	resetPasswordZodSchema,
	userLoginZodSchema,
	userRegistrationZodSchema
} from '../user';
import { AuthService } from '../services';

export function createAuthRouter( authService: AuthService ): Router {
	const router = Router();

	const signupController = createSignupController( authService );
	const loginController = createLoginController( authService );
	const verifyEmailController = createVerifyEmailController( authService );
	const forgotPasswordController = createForgotPasswordController( authService );
	const resetPasswordController = createResetPasswordController( authService );

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

	// Future routes:
	// router.post('/logout', ...);
	// router.get('/me', ...); // Example: Get current user

	return router;
}
