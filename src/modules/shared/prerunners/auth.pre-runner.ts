import { makeVerifyTokenUseCase } from "@/src/modules/user/adapters/factories/use-cases.factory";
import type { ControllerRequest } from "../adapters/http/elysia/controller";
import type { PreRunner } from "../adapters/http/elysia/pre-runners";

export const authPreRunner: PreRunner<any, any, any, any> = async (
	req: ControllerRequest<any, any, any, any>,
) => {
	const authHeader = req.headers.authorization || req.headers["x-access-token"];

	if (!authHeader) {
		throw {
			statusCode: 401,
			message: "Authorization header is required",
		};
	}

	const token = authHeader.startsWith("Bearer ")
		? authHeader.substring(7)
		: authHeader;

	if (!token) {
		throw {
			statusCode: 401,
			message: "Valid token is required",
		};
	}

	try {
		const verifyTokenUseCase = makeVerifyTokenUseCase();
		const userData = await verifyTokenUseCase.execute({ token });

		req.user = {
			id: userData.userId,
			email: userData.email,
			username: userData.username,
			role: userData.role,
		};
	} catch {
		throw {
			statusCode: 401,
			message: "Invalid or expired token",
		};
	}
};
