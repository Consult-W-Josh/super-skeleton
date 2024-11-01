import { IBaseModel } from '@super-skeleton/crud';

export interface IUser extends IBaseModel {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
