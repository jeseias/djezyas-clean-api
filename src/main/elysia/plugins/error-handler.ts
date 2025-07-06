import type { ErrorHandler } from "elysia";
import { AppError, ErrorCode } from "@/src/modules/shared/errors/app-error";

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

	if (error instanceof AppError) {
		set.status = error.statusCode;
		return {
			message: error.message,
			name: error.name,
			code: error.code,
		};
	}

	if (error instanceof Error && error.name === "NotFoundError") {
		set.status = 404;
		return {
			message: error.message,
			name: error.name,
			code: 404,
		};
	}

	set.status = 500;
	return {
		message: "Internal server error, please try again later.",
		name: "InternalServerError",
		code: ErrorCode.INTERNAL_SERVER_ERROR,
	};
};
