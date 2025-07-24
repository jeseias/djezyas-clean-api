import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Logger } from "../config/logger";
import { withUser } from "../elysia/plugins";

// Debug utility to trace error origins
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
			const err = error instanceof Error ? error : new Error("Unknown error");

			// Enhanced error logging with context
			Logger.error(`[GraphQL Error]: ${err.message}`, {
				error: {
					name: err.name,
					message: err.message,
					stack: err.stack,
				},
				context: {
					functionName: fn.name || "anonymous",
					args:
						args.length > 0
							? `Arguments count: ${args.length}`
							: "No arguments",
					argsTypes: args.map((arg) => typeof arg),
					timestamp: new Date().toISOString(),
				},
			});

			// If it's a GraphQL error, re-throw it as is
			if (error && typeof error === "object" && "extensions" in error) {
				throw error;
			}

			throw err instanceof AppError
				? err
				: new AppError(err.message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
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
