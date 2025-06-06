import { Types } from 'mongoose';
import {
	SsModel,
	SsOrms,
	SsSchema,
	SsSchemaFieldTypes
} from '@super-skeleton/crud';
import { ModelNames } from '../constants';

export interface IRefreshToken {
  _id?: Types.ObjectId | string;
  token: string;
  userId: Types.ObjectId | string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const refreshTokenSsSchema: SsSchema<IRefreshToken> = {
	token: {
		type: SsSchemaFieldTypes.UniqueRequiredString
		// Mongoose `unique` is not a constraint but creates a unique index.
		// True uniqueness check might be needed at application level if collisions are a concern with random tokens.
	},
	userId: {
		type: SsSchemaFieldTypes.RequiredObjectIdWithRef,
		extend: {
			ref: ModelNames.USER
		}
	},
	expiresAt: {
		type: SsSchemaFieldTypes.RequiredDate
	}
};

export const RefreshTokenModel: SsModel<IRefreshToken> = {
	name: ModelNames.REFRESH_TOKEN,
	schema: refreshTokenSsSchema,
	orm: SsOrms.mongoose
};
