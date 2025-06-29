import type { Context } from "elysia";
import { AppError } from "@/src/modules/shared/errors";
import { makeVerifyTokenUseCase } from "@/src/modules/user/adapters/factories/use-cases.factory";

const PUBLIC_OPERATIONS = [
	"registerUser",
	"login",
	"verifyEmail",
	"forgotPassword",
	"resetPassword",
	"resendVerification",
	"verifyToken",
];

export const authMiddleware = async (context: Context) => {
	const isGraphQL = context.request.url.includes("/graphql");

	if (!isGraphQL) {
		return {};
	}

	const body = await context.request.json().catch(() => ({}));
	const operationName = body.operationName;

	if (PUBLIC_OPERATIONS.includes(operationName)) {
		return {};
	}

	const token = context.headers["x-access-token"];

	if (!token) {
		context.set.status = 401;
		throw new AppError("Unauthorized: Token missing", 401);
	}

	try {
		const verifyTokenUseCase = makeVerifyTokenUseCase();
		const result = await verifyTokenUseCase.execute({ token });

		return {
			userId: result.userId,
			userEmail: result.email,
			userUsername: result.username,
			userRole: result.role,
		};
	} catch (error) {
		console.error(error);
		context.set.status = 401;
		throw new AppError("Unauthorized: Invalid token", 401);
	}
};
