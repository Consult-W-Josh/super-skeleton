import axios from 'axios';
import Cookies from 'js-cookie';

// Create an axios instance with default configuration
const api = axios.create( {
	baseURL: '/api',
	withCredentials: true, // Important for sending/receiving cookies
	headers: {
		'Content-Type': 'application/json',
		'ngrok-skip-browser-warning': 'true' // Header to bypass ngrok browser warning
	}
} );

// Add Authorization header dynamically when token is available
api.interceptors.request.use( ( config ) => {
	const token = Cookies.get( 'ss_access_token' );
	if ( token ) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
} );

// User profile interface
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  // Add any other user properties returned by your backend
}

/**
 * Fetch the authenticated user's profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
	try {
		const response = await api.get( '/auth/me' );
		return response.data;
	} catch ( error ) {
		console.error( 'Error fetching user profile:', error );
		throw error;
	}
};

/**
 * Log the user out by calling the logout endpoint
 * Includes the refresh token in the request body
 */
export const logout = async (): Promise<void> => {
	try {
		// Get the refresh token from cookies
		const refreshToken = Cookies.get( 'ss_refresh_token' );

		// Send the refresh token in the request body
		await api.post( '/auth/logout', { refreshToken } );

		// Clear cookies after successful logout
		Cookies.remove( 'ss_access_token' );
		Cookies.remove( 'ss_refresh_token' );
	} catch ( error ) {
		console.error( 'Error during logout:', error );
		throw error;
	}
};

export default api;
