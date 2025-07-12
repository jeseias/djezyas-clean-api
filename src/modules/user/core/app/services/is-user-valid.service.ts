import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { User } from "../../domain/entities";
import type { UserRepository } from "../../ports/outbound";

export class IsUserValidService {
	constructor(
		private readonly userRepository: Pick<UserRepository, "findById">,
	) {}

	async execute(userId: string): Promise<User.Entity> {
		const userModel = await this.userRepository.findById(userId);

		if (!userModel) {
			throw new AppError("User not found", 404, ErrorCode.USER_NOT_FOUND);
		}

		const user = User.Entity.fromModel(userModel);

		if (!user.isActive()) {
			throw new AppError(
				"User account must be active",
				400,
				ErrorCode.USER_NOT_ACTIVE,
			);
		}

		if (user.isBlocked()) {
			throw new AppError(
				"User account is blocked",
				400,
				ErrorCode.USER_BLOCKED,
			);
		}

		return user;
	}
}
