import { AppError } from "@/src/modules/shared/errors";
import type { TokenManager } from "@/src/modules/shared/ports/outbound/token-manager";
import { User } from "../../../domain/entities/user";

export namespace VerifyToken {
	export type Params = {
		token: string;
	};

	export type Result = {
		userId: string;
		email: string;
		username: string;
		role: User.UserRole;
	};
}

export class VerifyTokenUseCase {
	constructor(private readonly tokenManager: TokenManager) {}

	async execute(params: VerifyToken.Params): Promise<VerifyToken.Result> {
		const { token } = params;

		try {
			const payload = await this.tokenManager.verifyToken(token);

			const userId = payload.sub as string;
			const email = payload.email as string;
			const username = payload.username as string;
			const role = payload.role as User.UserRole;

			if (!userId || !email || !username || !role) {
				throw new AppError("Invalid token: missing required user data", 401);
			}

			if (!Object.values(User.UserRole).includes(role)) {
				throw new AppError("Invalid token: invalid user role", 401);
			}

			return {
				userId,
				email,
				username,
				role,
			};
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new AppError("Invalid or expired token", 401);
		}
	}
}
