import { AppError, ErrorCode } from "../errors";

/**
 * Helper function to wrap operations that might throw errors and convert them to AppError
 * @param operation - The operation to execute
 * @param errorMessage - The message to show if the operation fails
 * @param errorCode - The error code to use (defaults to ENTITY_NOT_FOUND)
 * @param statusCode - The HTTP status code (defaults to 404)
 * @returns The result of the operation or throws an AppError
 */
export async function tryCatch<T>(
	operation: () => T | Promise<T>,
	errorMessage: string,
	errorCode: ErrorCode = ErrorCode.ENTITY_NOT_FOUND,
	statusCode: number = 404,
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		// If it's already an AppError, re-throw it
		if (error instanceof AppError) {
			throw error;
		}

		// Convert any other error to AppError
		throw new AppError(errorMessage, statusCode, errorCode);
	}
}

/**
 * Helper function to wrap synchronous operations that might throw errors
 * @param operation - The operation to execute
 * @param errorMessage - The message to show if the operation fails
 * @param errorCode - The error code to use (defaults to ENTITY_NOT_FOUND)
 * @param statusCode - The HTTP status code (defaults to 404)
 * @returns The result of the operation or throws an AppError
 */
export function tryCatchSync<T>(
	operation: () => T,
	errorMessage: string,
	errorCode: ErrorCode = ErrorCode.ENTITY_NOT_FOUND,
	statusCode: number = 404,
): T {
	try {
		return operation();
	} catch (error) {
		console.log(error);
		// If it's already an AppError, re-throw it
		if (error instanceof AppError) {
			throw error;
		}

		// Convert any other error to AppError
		throw new AppError(errorMessage, statusCode, errorCode);
	}
}
