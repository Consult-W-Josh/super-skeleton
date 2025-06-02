import { Router } from 'express';
import {
	createLoginController,
	createSignupController
} from '../controllers';
import { validateRequestParts } from '../utils';
import { userLoginZodSchema, userRegistrationZodSchema } from '../user';
import { AuthService } from '../services';

export function createAuthRouter( authService: AuthService ): Router {
	const router = Router();

	const signupController = createSignupController( authService );
	const loginController = createLoginController( authService );

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

	// Future routes:
	// router.post('/logout', ...);
	// router.get('/verify-email/:token', ...);
	// router.post('/forgot-password', ...);
	// router.post('/reset-password/:token', ...);
	// router.get('/me', ...); // Example: Get current user

	return router;
}
