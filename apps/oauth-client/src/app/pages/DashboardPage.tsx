import React, { useState } from 'react';
import { logout, useAuth } from '@super-skeleton/auth-client';
import { Button, Card, CardBody, CardHeader } from '@super-skeleton/shared-ui';
import Cookies from 'js-cookie';

const DashboardPage: React.FC = () => {
	const { user, isLoading } = useAuth();
	const [copied, setCopied] = useState( false );
	const accessToken = Cookies.get( 'ss_access_token' ) || '';

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = '/';
		} catch ( error ) {
			console.error( 'Logout failed:', error );
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText( accessToken );
		setCopied( true );
		setTimeout( () => setCopied( false ), 2000 );
	};

	if ( isLoading ) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-alabaster">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-blue"></div>
			</div>
		);
	}

	if ( !user ) {
		return (
			<div className="min-h-screen bg-alabaster p-4 flex items-center justify-center">
				<Card className="w-full max-w-md p-6">
					<CardHeader>
						<h1 className="text-2xl font-semibold text-charcoal">
              Session Error
						</h1>
					</CardHeader>
					<CardBody>
						<p className="text-cool-gray">
              Unable to load user data. Please try logging in again.
						</p>
						<div className="mt-4">
							<Button onClick={() => ( window.location.href = '/' )}>
                Return to Login
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-alabaster flex">
			{/* Sidebar */}
			<div className="w-64 bg-white shadow-soft h-screen p-6 flex flex-col">
				<div className="flex items-center mb-8">
					<svg
						className="h-8 w-8 text-royal-blue"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						/>
					</svg>
					<span className="ml-3 text-xl font-semibold text-charcoal">
            OAuth Client
					</span>
				</div>

				<nav className="flex-1">
					<a
						href="/dashboard"
						className="flex items-center px-4 py-2 text-royal-blue bg-royal-blue/5 rounded-md"
					>
						<svg
							className="h-5 w-5 mr-3"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
            Dashboard
					</a>
				</nav>

				<div className="mt-auto">
					<Button
						variant="outline"
						className="w-full justify-center"
						onClick={handleLogout}
					>
						<svg
							className="h-5 w-5 mr-2"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
            Logout
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 p-8">
				<h1 className="text-4xl font-bold tracking-tight text-charcoal">
          Welcome back, {user.firstName}!
				</h1>

				<div className="mt-8 grid gap-6 md:grid-cols-2">
					{/* User Info Card */}
					<Card>
						<CardHeader>
							<h2 className="text-2xl font-semibold text-charcoal">
                Your Profile
							</h2>
						</CardHeader>
						<CardBody>
							<div className="flex items-center">
								{user.picture && (
									<img
										src={user.picture}
										alt={user.firstName}
										className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
									/>
								)}
								<div className="ml-4">
									<h3 className="text-lg font-semibold text-charcoal">
										{user.firstName} {user.lastName}
									</h3>
									<p className="text-cool-gray">{user.email}</p>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Session Token Card */}
					<Card>
						<CardHeader className="flex justify-between items-center">
							<h2 className="text-2xl font-semibold text-charcoal">
                Developer Info: Session Token
							</h2>
							<Button
								variant="text"
								size="sm"
								onClick={copyToClipboard}
								className="flex items-center"
							>
								<svg
									className="h-4 w-4 mr-1"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
								{copied ? 'Copied!' : 'Copy'}
							</Button>
						</CardHeader>
						<CardBody>
							<div className="bg-alabaster rounded-md p-4 max-h-40 overflow-auto">
								<pre className="text-xs font-mono whitespace-pre-wrap break-all">
									{accessToken}
								</pre>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
