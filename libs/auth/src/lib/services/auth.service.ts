import { executeLoginUser, executeRegisterUser } from './functions';
import { SsModel } from '@super-skeleton/crud';
import { BaseEventEmitterService } from '../base';
import {
	IUser,
	UserLoginInput,
	UserModel,
	UserRegistrationInput
} from '../user';

interface AuthServiceOptions {
  jwtSecret: string;
  refreshJwtSecret: string;
  eventEmitter?: BaseEventEmitterService;
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  userModel?: SsModel<IUser>;
}

export class AuthService extends BaseEventEmitterService {
	private readonly jwtSecret: string;
	private readonly refreshJwtSecret: string;
	private readonly accessTokenExpiry: string;
	private readonly refreshTokenExpiry: string;
	private readonly userModel: SsModel<IUser>;

	constructor( options: AuthServiceOptions ) {
		super();
		this.jwtSecret = options.jwtSecret;
		this.refreshJwtSecret = options.refreshJwtSecret;
		this.accessTokenExpiry = options.accessTokenExpiry || '15m';
		this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
		this.userModel = options.userModel || UserModel;
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
			refreshTokenExpiry: this.refreshTokenExpiry
		} );
	}
}
