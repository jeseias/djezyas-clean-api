import type { Context } from "elysia";
import type { Controller, ControllerRequest } from "./controller";

export function elysiaControllerAdapter<
	TBody = any,
	TQuery = any,
	TParams = any,
	THeaders = any,
	TResult = any,
>(
	controller: Controller<TBody, TQuery, TParams, THeaders, TResult>,
	requestMapper?: (
		ctx: Context,
	) => ControllerRequest<TBody, TQuery, TParams, THeaders>,
) {
	return async (ctx: Context) => {
		const defaultMapper = (
			ctx: Context,
		): ControllerRequest<TBody, TQuery, TParams, THeaders> => ({
			body: ctx.body as TBody,
			query: ctx.query as TQuery,
			params: ctx.params as TParams,
			headers: ctx.headers as THeaders,
			user: (ctx as any).user,
			meta: {},
		});

		const mapper = requestMapper || defaultMapper;
		const request = mapper(ctx);

		const response = await controller.handle(request);

		ctx.set.status = response.statusCode;
		return response.data;
	};
}
