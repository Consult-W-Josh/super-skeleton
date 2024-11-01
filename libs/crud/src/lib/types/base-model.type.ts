import { Types } from 'mongoose';

export interface IBaseModel {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
