import { z } from 'zod';

export const userRegistrationZodSchema = z.object( {
	email: z.string().email().toLowerCase().trim().min( 1 ),
	username: z
		.string()
		.min( 3 )
		.max( 30 )
		.regex(
			/^\w+$/,
			'Username can only contain alphanumeric characters and underscores.'
		)
		.toLowerCase()
		.trim()
		.optional(),
	password: z.string().min( 8 ).max( 128 ),
	firstName: z.string().trim().min( 1 ).max( 50 ).optional(),
	lastName: z.string().trim().min( 1 ).max( 50 ).optional()
} );

export const userLoginZodSchema = z.object( {
	emailOrUsername: z.string().min( 1 ),
	password: z.string().min( 1 )
} );

export const forgotPasswordZodSchema = z.object( {
	email: z.string().email().toLowerCase().trim().min( 1 )
} );

export const resetPasswordZodSchema = z.object( {
	token: z.string().min( 1 ),
	newPassword: z.string().min( 8 ).max( 128 )
} );

export const resendVerificationEmailZodSchema = z.object( {
	email: z.string().email().toLowerCase().trim().min( 1 )
} );

export const refreshTokenZodSchema = z.object( {
	refreshToken: z.string().min( 1 )
} );

export const logoutZodSchema = z.object( {
	refreshToken: z.string().min( 1 )
} );

export type UserRegistrationInput = z.infer<typeof userRegistrationZodSchema>;
export type UserLoginInput = z.infer<typeof userLoginZodSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordZodSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordZodSchema>;
export type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailZodSchema
>;
export type RefreshTokenInput = z.infer<typeof refreshTokenZodSchema>;
export type LogoutInput = z.infer<typeof logoutZodSchema>;
