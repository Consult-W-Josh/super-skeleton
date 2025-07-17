import React from 'react';
import { useAuth } from '@super-skeleton/auth-client';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ( { children } ) => {
	const { isAuthenticated, isLoading } = useAuth();

	if ( isLoading ) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-alabaster">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue"></div>
			</div>
		);
	}

	if ( !isAuthenticated ) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
