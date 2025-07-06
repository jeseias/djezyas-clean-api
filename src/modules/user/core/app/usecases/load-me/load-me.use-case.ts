import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound";

export namespace LoadMe {
	export type Params = {
		userId: string;
	};

	export type Result = User.Model;
}

export class LoadMeUseCase {
	constructor(
		private readonly userRepository: Pick<UserRepository, "findById">,
	) {}

	async execute(params: LoadMe.Params): Promise<LoadMe.Result> {
		const { userId } = params;

		const userModel = await this.userRepository.findById(userId);
		if (!userModel) {
			throw new AppError("User not found", 404, ErrorCode.USER_NOT_FOUND);
		}

		const user = User.Entity.fromModel(userModel);

		if (!user.isActive()) {
			throw new AppError(
				"User account is not active",
				403,
				ErrorCode.USER_NOT_ACTIVE,
			);
		}

		return user.toJSON();
	}
}
