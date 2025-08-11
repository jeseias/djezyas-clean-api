import { GraphQLError } from "graphql";
import { AppError } from "@/src/modules/shared/errors/app-error";

export const maskGraphQLError = (
	error: unknown,
	message: string,
	isDev?: boolean,
): Error => {
	// Enhanced error logging for better debugging
	console.log("🔍 GraphQL Error Analysis:");
	console.log("  📝 Error Type:", error?.constructor?.name);
	console.log(
		"  📄 Error Message:",
		error instanceof Error ? error.message : String(error),
	);
	console.log("  🎯 User Message:", message);
	console.log("  🌍 Environment:", isDev ? "Development" : "Production");

	if (error instanceof Error) {
		console.log("  📚 Stack Trace:", error.stack);
	}

	// Check for MongoDB validation errors
	if (
		error instanceof Error &&
		error.message.includes("Cast to ObjectId failed")
	) {
		console.log("  🚨 MongoDB ObjectId Cast Error Detected!");
		console.log(
			"  💡 This usually means you're passing string IDs where ObjectIds are expected",
		);
		console.log(
			"  🔧 Solution: Convert string IDs to ObjectIds or change schema to use String type",
		);
	}

	// Check for validation errors
	if (error instanceof Error && error.message.includes("validation failed")) {
		console.log("  🚨 MongoDB Validation Error Detected!");
		console.log("  💡 Check your schema requirements and data types");
	}

	if (
		error instanceof GraphQLError &&
		error.originalError instanceof AppError
	) {
		console.log("  ✅ AppError detected - preserving original error structure");
		return new GraphQLError(error.message, {
			nodes: error.nodes,
			source: error.source,
			positions: error.positions,
			path: error.path,
			originalError: error.originalError,
			extensions: {
				...error.extensions,
				code: error.originalError.code,
				statusCode: error.originalError.statusCode,
				// Add helpful debugging info
				debugInfo: isDev
					? {
							originalErrorType: error.originalError.constructor.name,
							originalErrorCode: error.originalError.code,
							originalErrorStatusCode: error.originalError.statusCode,
						}
					: undefined,
			},
		});
	}

	if (isDev) {
		// In development, provide more detailed error information
		const detailedMessage =
			error instanceof Error
				? `${message}: ${error.message}`
				: `${message}: ${String(error)}`;

		console.log("  🛠️ Development mode - returning detailed error");
		return new Error(detailedMessage);
	}

	// In production, return a generic message
	console.log("  🏭 Production mode - returning generic error");
	return new Error(message);
};
