import { AppError } from "@/src/modules/shared/errors";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound";

export namespace VerifyEmail {
	export type Params = {
		email: string;
		verificationCode: string;
	};

	export type Result = {
		user: User.Model;
		message: string;
	};
}

export class VerifyEmailUseCase {
	constructor(
		private readonly userRepository: Pick<
			UserRepository,
			"findByEmail" | "update"
		>,
	) {}

	async execute(params: VerifyEmail.Params): Promise<VerifyEmail.Result> {
		const { email, verificationCode } = params;

		const userModel = await this.userRepository.findByEmail(email);
		if (!userModel) {
			throw new AppError("User not found", 404);
		}

		const user = User.Entity.fromModel(userModel);

		if (user.isEmailVerified()) {
			throw new AppError("Email is already verified", 400);
		}

		if (!user.isVerificationCodeValid(verificationCode)) {
			if (user.isVerificationCodeExpired()) {
				throw new AppError("Verification code has expired", 400);
			}
			throw new AppError("Invalid verification code", 400);
		}

		user.verifyEmail();

		await this.userRepository.update(user.toJSON());

		return {
			user: user.toJSON(),
			message: "Email verified successfully. Your account is now active.",
		};
	}
}
