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
