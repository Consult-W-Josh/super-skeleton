import { z } from 'zod';

export const userRegistrationZodSchema = z.object( {
	email: z.string().email().toLowerCase().trim(),
	username: z.string()
		.min( 3 )
		.max( 30 )
		.regex( /^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores." )
		.toLowerCase()
		.trim()
		.optional(),
	password: z.string().min( 8 ).max( 128 ),
	firstName: z.string().trim().min( 1 ).max( 50 ).optional(),
	lastName: z.string().trim().min( 1 ).max( 50 ).optional(),
} );

export const userLoginZodSchema = z.object( {
	emailOrUsername: z.string().min( 1 ),
	password: z.string().min( 1 ),
} );

export type UserRegistrationInput = z.infer<typeof userRegistrationZodSchema>;
export type UserLoginInput = z.infer<typeof userLoginZodSchema>;
