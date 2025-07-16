import type { ControllerRequest, PreRunner } from "../adapters/http/elysia";
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
    }
  }
}