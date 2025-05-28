import { useDb, createModel, init, md, createSchema } from './lib';

export const ssCrud = {
	init,
	useDb,
	createModel,
	createSchema,
	md,
};

export * from './lib';