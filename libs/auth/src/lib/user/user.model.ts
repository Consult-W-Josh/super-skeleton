import { Types } from 'mongoose';
import { SsModel, SsOrms, SsSchema, SsSchemaFieldTypes } from '@super-skeleton/crud';
import { ModelNames } from '../constants/model-names.constants';

export interface IUser {
  _id?: Types.ObjectId | string;
  email: string;
  username?: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  isAccountLocked: boolean;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const userSsSchema: SsSchema<IUser> = {
	email: {
		type: SsSchemaFieldTypes.UniqueRequiredString,
		extend: {
			lowercase: true,
			trim: true,
		}
	},
	username: {
		type: SsSchemaFieldTypes.RequiredString,
		extend: {
			required: false,
			unique: true,
			sparse: true,
			lowercase: true,
			trim: true,
			minlength: 3
		}
	},
	passwordHash: {
		type: SsSchemaFieldTypes.RequiredString
	},
	firstName: {
		type: SsSchemaFieldTypes.RequiredString,
		extend: {
			required: false,
			trim: true
		}
	},
	lastName: {
		type: SsSchemaFieldTypes.RequiredString,
		extend: {
			required: false,
			trim: true
		}
	},
	isEmailVerified: {
		type: SsSchemaFieldTypes.RequiredBooleanDefaultFalse
	},
	emailVerificationToken: {
		type: SsSchemaFieldTypes.RequiredString,
		extend: {
			required: false,
			unique: true,
			sparse: true
		}
	},
	emailVerificationTokenExpiresAt: {
		type: SsSchemaFieldTypes.OptionalDate
	},
	passwordResetToken: {
		type: SsSchemaFieldTypes.RequiredString,
		extend: {
			required: false,
			unique: true,
			sparse: true
		}
	},
	passwordResetTokenExpiresAt: {
		type: SsSchemaFieldTypes.OptionalDate
	},
	isAccountLocked: {
		type: SsSchemaFieldTypes.RequiredBooleanDefaultFalse
	},
	failedLoginAttempts: {
		type: SsSchemaFieldTypes.RequiredNumberWithDefault,
		extend: {
			default: 0
		}
	},
	lastLoginAt: {
		type: SsSchemaFieldTypes.OptionalDate
	}
};

export const UserModel: SsModel<IUser> = {
	name: ModelNames.USER,
	schema: userSsSchema,
	orm: SsOrms.mongoose
};
