import type { Context } from "elysia";
import { verifyTokenUseCase } from "@/src/modules/user/adapters/factories/use-case.factory";

export const authMiddleware = async (context: Context) => {
	const token = context.headers["x-access-token"];

	if (!token) {
		context.set.status = 401;
		throw new Error("Unauthorized: Token missing");
	}

	try {
		const result = await verifyTokenUseCase.execute({ token });
		return { userId: result.userId };
	} catch (error) {
		console.error(error);
		context.set.status = 401;
		throw new Error("Unauthorized: Invalid token");
	}
};
