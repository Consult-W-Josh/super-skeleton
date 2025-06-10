# OAuth Client Application

This is a beautiful React application built within the Nx monorepo for testing OAuth 2.0 authentication with Google. The application features a classic, elegant design with a focus on user experience.

## Features

- Google OAuth 2.0 authentication flow
- Protected routes with authentication checks
- Beautiful UI with a classic design system
- Responsive layout for all device sizes
- Token management and display for debugging

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm package manager

### Installation

1. Install dependencies at the root of the monorepo:

```bash
pnpm install
```

### Running the Application

1. Start the OAuth client application:

```bash
pnpm nx serve apps/oauth-client
```

2. Ensure the backend is running at `http://localhost:4200` (or update the proxy configuration in `apps/oauth-client/proxy.conf.json` if your backend URL is different).

3. Open your browser and navigate to `http://localhost:4200` to see the application.

## Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. The browser is redirected to `/api/auth/google` which is proxied to the backend
3. The backend handles the OAuth flow with Google
4. Upon successful authentication, the backend sets cookies and redirects to `/dashboard`
5. The dashboard page checks for the presence of the access token cookie
6. If authenticated, the user's profile information is displayed

## Project Structure

- `apps/oauth-client/` - Main application code
  - `src/app/components/` - Reusable components
  - `src/app/pages/` - Page components
- `libs/shared/data-access/auth-client/` - Authentication logic and API services
- `libs/shared/ui/` - Shared UI components

## Design System

The application uses a custom "Classic Beautiful" design system with:

- A refined color palette with alabaster backgrounds and royal blue accents
- The Inter font family for clean typography
- Soft shadows and subtle animations
- Consistent spacing and component styling
