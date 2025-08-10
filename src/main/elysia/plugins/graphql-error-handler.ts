import { GraphQLError } from "graphql";
import { AppError } from "@/src/modules/shared/errors/app-error";

export const maskGraphQLError = (
	error: unknown,
	message: string,
	isDev?: boolean,
): Error => {
	console.log("GraphQL error details:", {
		error: error instanceof Error ? error.message : String(error),
		errorType: error?.constructor?.name,
		message,
		isDev,
		stack: error instanceof Error ? error.stack : undefined,
	});

	if (
		error instanceof GraphQLError &&
		error.originalError instanceof AppError
	) {
		console.log("AppError detected:", error.originalError);
		return new GraphQLError(error.message, {
			nodes: error.nodes,
			source: error.source,
			positions: error.positions,
			path: error.path,
			originalError: error.originalError,
			extensions: {
				...error.extensions,
				code: error.originalError.code,
			},
		});
	}

	if (isDev) {
		return new Error(
			`${message}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	return new Error(message);
};
