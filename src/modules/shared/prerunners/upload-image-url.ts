import type { ControllerRequest } from "../adapters/http/elysia";
import type { PreRunner } from "../adapters/http/elysia/pre-runners";
import type { StorageAdapter } from "../ports/storage-adapter";

export const uploadImageUrlPreRunner = <
	Body = unknown,
	Query = unknown,
	Params = unknown,
	Headers = unknown,
>(
	storageAdapter: StorageAdapter,
	fieldName: string,
): PreRunner<Body, Query, Params, Headers> => {
	return async (req: ControllerRequest<Body, Query, Params, Headers>) => {
		const file = (req.body as any)?.[fieldName];
		if (!(file instanceof File)) return;

		const url = await storageAdapter.upload(file);

		req.body = {
			...req.body,
			[fieldName]: url,
		};
	};
};
