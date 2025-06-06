import {
	executeEmailVerification,
	executeGetCurrentUser,
	executeGoogleLogin,
	executeLoginUser,
	executeLogout,
	executeRefreshToken,
	executeRegisterUser,
	executeRequestPasswordReset,
	executeResendVerificationEmail,
	executeResetPassword
} from './functions';
import { SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../base';
import {
	ForgotPasswordInput,
	IUser,
	LogoutInput,
	RefreshTokenInput,
	ResendVerificationEmailInput,
	ResetPasswordInput,
	UserLoginInput,
	UserModel,
	UserRegistrationInput
} from '../user';
import { AuthHookUser } from '../types';

interface AuthServiceOptions {
  jwtSecret: string;
  refreshJwtSecret: string;
  eventEmitter?: BaseEventEmitterService;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  userModel?: SsModel<IUser>;
  requireEmailVerificationForLogin?: boolean;
  googleOAuth?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
  };
}

export class AuthService extends BaseEventEmitterService {
	private readonly jwtSecret: string;
	private readonly refreshJwtSecret: string;
	private readonly accessTokenExpiry: string;
	private readonly refreshTokenExpiry: string;
	private readonly userModel: SsModel<IUser>;
	private readonly requireEmailVerificationForLogin: boolean;
	public readonly googleOAuthClient?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
  };

	constructor( options: AuthServiceOptions ) {
		super();
		this.jwtSecret = options.jwtSecret;
		this.refreshJwtSecret = options.refreshJwtSecret;
		this.accessTokenExpiry = options.accessTokenExpiry || '15m';
		this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
		this.userModel = options.userModel || UserModel;
		this.requireEmailVerificationForLogin =
      options.requireEmailVerificationForLogin === undefined
      	? true
      	: options.requireEmailVerificationForLogin;

		if ( options.googleOAuth && options.googleOAuth.clientId ) {
			this.googleOAuthClient = {
				clientId: options.googleOAuth.clientId,
				clientSecret: options.googleOAuth.clientSecret,
				redirectUri: options.googleOAuth.redirectUri,
				successRedirectUrl: options.googleOAuth.successRedirectUrl,
				failureRedirectUrl: options.googleOAuth.failureRedirectUrl
			};
		}
	}

	public async registerUser( data: UserRegistrationInput ): Promise<IUser> {
		return executeRegisterUser( {
			data,
			userModel: this.userModel,
			eventEmitter: this
		} );
	}

	public async loginUser( data: UserLoginInput ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Pick<IUser, '_id' | 'email' | 'firstName' | 'lastName'>;
  }> {
		return executeLoginUser( {
			data,
			userModel: this.userModel,
			eventEmitter: this,
			jwtSecret: this.jwtSecret,
			refreshJwtSecret: this.refreshJwtSecret,
			accessTokenExpiry: this.accessTokenExpiry,
			refreshTokenExpiry: this.refreshTokenExpiry,
			requireEmailVerificationForLogin: this.requireEmailVerificationForLogin
		} );
	}

	public async verifyUserEmail( token: string ): Promise<boolean> {
		return executeEmailVerification( {
			token,
			userModel: this.userModel
		} );
	}

	public async requestPasswordReset( data: ForgotPasswordInput ): Promise<void> {
		return executeRequestPasswordReset( {
			data,
			userModel: this.userModel,
			eventEmitter: this
		} );
	}

	public async resetPassword( data: ResetPasswordInput ): Promise<void> {
		return executeResetPassword( {
			data,
			userModel: this.userModel,
			eventEmitter: this
		} );
	}

	public async resendVerificationEmail(
		data: ResendVerificationEmailInput
	): Promise<void> {
		return executeResendVerificationEmail( {
			data,
			userModel: this.userModel,
			eventEmitter: this
		} );
	}

	public async refreshToken( data: RefreshTokenInput ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
		return executeRefreshToken( {
			data,
			userModel: this.userModel,
			jwtSecret: this.jwtSecret,
			accessTokenExpiry: this.accessTokenExpiry,
			newRefreshTokenExpiry: this.refreshTokenExpiry
		} );
	}

	public async logout( data: LogoutInput ): Promise<void> {
		return executeLogout( {
			data,
			eventEmitter: this
		} );
	}

	public async getCurrentUser(
		userId: string
	): Promise<AuthHookUser | null> {
		return executeGetCurrentUser( {
			userId,
			userModel: this.userModel
		} );
	}

	public async loginWithGoogle( code: string ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Pick<IUser, '_id' | 'email' | 'firstName' | 'lastName'>;
  }> {
		if ( !this.googleOAuthClient ) {
			throw new Error( 'GOOGLE_OAUTH_NOT_CONFIGURED' );
		}
		return executeGoogleLogin( {
			code,
			googleOAuthClientConfig: this.googleOAuthClient,
			userModel: this.userModel,
			eventEmitter: this,
			jwtSecret: this.jwtSecret,
			accessTokenExpiry: this.accessTokenExpiry,
			refreshTokenExpiry: this.refreshTokenExpiry
		} );
	}
}
