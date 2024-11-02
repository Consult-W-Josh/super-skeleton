import { Model } from 'mongoose';
import { isMongooseModel, validateDbOp } from './helpers';
import { crudErrors } from '../../constants';
import { DbOp, DbOpReturnType, UseDbConfig } from '../../types';

export async function useDb<T, Op extends DbOp>({
  op,
  model,
  config
}: {
  op: Op;
  model: Model<T>;
  config: UseDbConfig<T>;
}): Promise<DbOpReturnType<T>[Op]> {
  if (!isMongooseModel(model)) {
    throw new Error(crudErrors.invalidModel);
  }
  validateDbOp[op](config);

  const operations: Record<DbOp, () => Promise<any>> = {
    [DbOp.c]: async () => model.create(config.data),
    [DbOp.r]: async () => model.findOne(config.query),
    [DbOp.l]: async () => model.find(config.query),
    [DbOp.u]: async () =>
      model.findOneAndUpdate(config.query, config.data, { new: true }),
    [DbOp.um]: async () => model.updateMany(config.query, config.data)
  };

  return operations[op]() as Promise<DbOpReturnType<T>[Op]>;
}
