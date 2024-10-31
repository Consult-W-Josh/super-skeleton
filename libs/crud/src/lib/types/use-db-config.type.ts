import { FilterQuery } from 'mongoose';

export type UseDbConfig<T> = {
  query?: FilterQuery<T>;
  data?: Partial<T>;
};
