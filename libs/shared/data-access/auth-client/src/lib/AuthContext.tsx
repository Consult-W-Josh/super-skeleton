import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState
} from 'react';
import Cookies from 'js-cookie';
import { getUserProfile, UserProfile } from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  checkAuth: () => Promise<boolean>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>( undefined );

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ( { children } ) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>( false );
	const [user, setUser] = useState<UserProfile | null>( null );
	const [isLoading, setIsLoading] = useState<boolean>( true );
	const [error, setError] = useState<Error | null>( null );

	const checkAuth = async (): Promise<boolean> => {
		setIsLoading( true );
		setError( null );

		try {
			// Check if the access token cookie exists
			const accessToken = Cookies.get( 'ss_access_token' );

			if ( !accessToken ) {
				setIsAuthenticated( false );
				setUser( null );
				setIsLoading( false );
				return false;
			}

			// Fetch user profile if token exists
			const userProfile = await getUserProfile();
			setUser( userProfile );
			setIsAuthenticated( true );
			setIsLoading( false );
			return true;
		} catch ( err ) {
			setError(
				err instanceof Error ? err : new Error( 'Authentication check failed' )
			);
			setIsAuthenticated( false );
			setUser( null );
			setIsLoading( false );
			return false;
		}
	};

	const clearAuth = () => {
		setIsAuthenticated( false );
		setUser( null );
	};

	// Check authentication status on initial load
	useEffect( () => {
		checkAuth();
	}, [] );

	const value = {
		isAuthenticated,
		user,
		isLoading,
		error,
		checkAuth,
		clearAuth
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext( AuthContext );
	if ( context === undefined ) {
		throw new Error( 'useAuth must be used within an AuthProvider' );
	}
	return context;
};

export default AuthContext;
