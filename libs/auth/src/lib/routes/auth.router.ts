import { Router } from 'express';
import {
	createLoginController,
	createSignupController,
	createVerifyEmailController
} from '../controllers';
import { validateRequestParts } from '../utils';
import { userLoginZodSchema, userRegistrationZodSchema } from '../user';
import { AuthService } from '../services';

export function createAuthRouter( authService: AuthService ): Router {
	const router = Router();

	const signupController = createSignupController( authService );
	const loginController = createLoginController( authService );
	const verifyEmailController = createVerifyEmailController( authService );

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

	// Future routes:
	// router.post('/logout', ...);
	// router.post('/forgot-password', ...);
	// router.post('/reset-password/:token', ...);
	// router.get('/me', ...); // Example: Get current user

	return router;
}
