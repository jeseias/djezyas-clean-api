import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { PasswordHasher } from "@/src/modules/shared/ports/outbound/password-hasher";
import { password } from "@/src/modules/shared/value-objects/password";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound";

export namespace ResetPassword {
	export type Params = {
		token: string;
		newPassword: string;
	};

	export type Result = {
		message: string;
	};
}

export class ResetPasswordUseCase {
	constructor(
		private readonly userRepository: Pick<
			UserRepository,
			"findByPasswordResetToken" | "update"
		>,
		private readonly passwordHasher: PasswordHasher,
	) {}

	async execute(params: ResetPassword.Params): Promise<ResetPassword.Result> {
		const { token, newPassword } = params;

		password(newPassword);

		const userModel = await this.userRepository.findByPasswordResetToken(token);
		if (!userModel) {
			throw new AppError("Invalid or expired reset token", 400, ErrorCode.INVALID_RESET_TOKEN);
		}

		const user = User.Entity.fromModel(userModel);

		if (!user.isPasswordResetTokenValid(token)) {
			throw new AppError("Invalid or expired reset token", 400, ErrorCode.INVALID_RESET_TOKEN);
		}

		const hashedPassword = await this.passwordHasher.hash(newPassword);

		user.updatePassword(hashedPassword);
		user.clearPasswordResetToken();

		await this.userRepository.update(user.toJSON());

		return {
			message: "Password has been reset successfully",
		};
	}
}
