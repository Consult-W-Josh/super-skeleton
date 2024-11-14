import { FilterQuery } from 'mongoose';

export enum DbOp {
  c = 'create',
  r = 'read',
  l = 'list',
  u = 'update',
  um = 'update-many'
}

export type DbOpReturnType<T> = {
  [DbOp.c]: T;
  [DbOp.r]: T | null;
  [DbOp.l]: T[];
  [DbOp.u]: T | null;
  [DbOp.um]: void;
};

export type Query<T> = { query: FilterQuery<T> };
export type Data<T> = { data: Partial<T> };

export type UseDbConfig<T> = Query<T> & Data<T>

export type UseDbConfigType<T> = {
  [DbOp.c]: Data<T>;
  [DbOp.r]: Query<T>;
  [DbOp.l]: Query<T>;
  [DbOp.u]: Query<T> & Data<T>;
  [DbOp.um]: Query<T> & Data<T>;
};
