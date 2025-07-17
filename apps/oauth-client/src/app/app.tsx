import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@super-skeleton/auth-client';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

export function App() {
	return (
		<AuthProvider>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</AuthProvider>
	);
}

export default App;
