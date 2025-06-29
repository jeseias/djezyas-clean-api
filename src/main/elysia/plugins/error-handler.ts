import type { ErrorHandler } from "elysia";
import { AppError } from "@/src/modules/shared/errors";

export const errorHandler: ErrorHandler = ({ error, set }) => {
	console.error("==>==>==> Application error:", {
		error:
			error instanceof Error
				? {
						name: error.name,
						message: error.message,
						stack: error.stack,
					}
				: error,
	});

	// Handle our custom AppError
	if (error instanceof AppError) {
		set.status = error.statusCode;
		return {
			message: error.message,
			name: error.name,
		};
	}

	// Handle Elysia's NotFoundError
	if (error instanceof Error && error.name === "NotFoundError") {
		set.status = 404;
		return {
			message: error.message,
			name: error.name,
		};
	}

	// Handle any other errors
	set.status = 500;
	return {
		message: "Internal server error, please try again later.",
		name: "InternalServerError",
	};
};
