import { AppError } from "../../../errors";

type AuthenticatedUser = {
	id: string;
	email: string;
	username: string;
	role: string;
};

export type ControllerRequest<
	Body = unknown,
	Query = unknown,
	Params = unknown,
	Headers = unknown,
	Result = unknown,
> = {
	body: Body;
	query: Query;
	params: Params;
	headers: Headers;
	user?: AuthenticatedUser;
	meta?: Record<string, unknown>;
};

export type ControllerResponse<T = unknown> = {
	statusCode: number;
	data?: T;
};

export type PreRunner<Body, Query, Params, Headers> = (
	req: ControllerRequest<Body, Query, Params, Headers>,
) => Promise<void>;

export abstract class Controller<Body, Query, Params, Headers, Result> {
	constructor(
		private readonly useCase: {
			execute: (params: Body) => Promise<Result>;
		},
		private readonly preRunners: PreRunner<Body, Query, Params, Headers>[] = [],
	) {}

	abstract execute(
		request: ControllerRequest<Body, Query, Params, Headers, Result>,
	): Promise<ControllerResponse>;

	async handle(
		request: ControllerRequest<Body, Query, Params, Headers>,
	): Promise<ControllerResponse> {
		try {
			for (const runner of this.preRunners) {
				await runner(request);
			}

			const result = await this.useCase.execute(request.body);

			return {
				statusCode: 200,
				data: result,
			};
		} catch (error) {
			console.error("Controller error:", error);

			if (error instanceof AppError) {
				return {
					statusCode: error.statusCode,
					data: { message: error.message, code: error.code },
				};
			}

			return {
				statusCode: 500,
				data: { message: "Internal server error" },
			};
		}
	}
}
