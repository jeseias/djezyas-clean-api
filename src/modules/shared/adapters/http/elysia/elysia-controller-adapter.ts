import type { Context } from "elysia";

export type ElysiaController<
	TBody = any,
	THeaders = any,
	TQuery = any,
	TParams = any,
	TResponse = any,
> = (
	ctx: Context<{
		body: TBody;
		headers: THeaders;
		query: TQuery;
		params: TParams;
	}>,
) => Promise<TResponse>;

export function elysiaControllerAdapter<
	T extends (...args: any[]) => Promise<any>,
>(handler: T): T {
	return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		return await handler(...args);
	}) as T;
}
