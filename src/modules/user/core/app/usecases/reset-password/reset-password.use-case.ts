import { AppError } from "@/src/modules/shared/errors";
import type { CryptoRepository } from "@/src/modules/shared/ports/outbound/crypto-repository";
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
		private readonly cryptoRepository: CryptoRepository,
	) {}

	async execute(params: ResetPassword.Params): Promise<ResetPassword.Result> {
		const { token, newPassword } = params;

		password(newPassword);

		const userModel = await this.userRepository.findByPasswordResetToken(token);
		if (!userModel) {
			throw new AppError("Invalid or expired reset token", 400);
		}

		const user = User.Entity.fromModel(userModel);

		if (!user.isPasswordResetTokenValid(token)) {
			if (user.isPasswordResetTokenExpired()) {
				throw new AppError("Reset token has expired", 400);
			}
			throw new AppError("Invalid reset token", 400);
		}

		const hashedPassword = await this.cryptoRepository.hash(newPassword);

		user.updatePassword(hashedPassword);

		user.clearPasswordResetToken();

		await this.userRepository.update(user.toJSON());

		return {
			message:
				"Password has been reset successfully. You can now log in with your new password.",
		};
	}
}
