import { GraphQLError } from "graphql";
import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { withUser } from "../elysia/plugins";

export const debugResolver = <T extends (...args: any[]) => Promise<any>>(
	fn: T,
	resolverName: string,
): T => {
	return (async (...args: any[]) => {
		try {
			console.log(`🔍 [DEBUG] Entering resolver: ${resolverName}`);
			console.log(`🔍 [DEBUG] Args count: ${args.length}`);

			const result = await fn(...args);

			console.log(`✅ [DEBUG] Resolver ${resolverName} completed successfully`);
			return result;
		} catch (error) {
			console.error(`❌ [DEBUG] Error in resolver: ${resolverName}`, {
				error:
					error instanceof Error
						? {
								name: error.name,
								message: error.message,
								stack: error.stack,
							}
						: error,
				resolverName,
				timestamp: new Date().toISOString(),
			});
			throw error;
		}
	}) as T;
};

export const handleResolver = <T extends (...args: any[]) => Promise<any>>(
	fn: T,
): T => {
	return (async (...args: any[]) => {
		try {
			return await fn(...args);
		} catch (error) {
			// If it's already a GraphQLError, re-throw it as is
			if (error instanceof GraphQLError) {
				throw error;
			}

			// If it's an AppError, wrap it in a GraphQLError
			if (error instanceof AppError) {
				throw new GraphQLError(error.message, {
					extensions: {
						code: error.code,
						statusCode: error.statusCode,
					},
				});
			}

			// For other errors, create a generic AppError and wrap it
			const err = error instanceof Error ? error : new Error("Unknown error");
			const appError = new AppError(
				err.message,
				500,
				ErrorCode.INTERNAL_SERVER_ERROR,
			);
			throw new GraphQLError(appError.message, {
				extensions: {
					code: appError.code,
					statusCode: appError.statusCode,
				},
			});
		}
	}) as T;
};

export const makeResolver = <T extends (...args: any[]) => any>(
	fn: T,
	options?: {
		isAdmin?: boolean;
		requireAuth?: boolean;
	},
): ReturnType<typeof withUser> | T => {
	const resolver = handleResolver(fn);

	if (options?.requireAuth === false) {
		return resolver;
	}

	return withUser(resolver, options);
};
