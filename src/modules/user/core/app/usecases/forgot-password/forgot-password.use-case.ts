import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound/user-repository";
import type { TemplateService } from "../../services/template-service";

export namespace ForgotPassword {
	export type Params = {
		email: string;
	};

	export type Result = {
		message: string;
		expiresIn: string;
	};
}

export class ForgotPasswordUseCase {
	constructor(
		private readonly userRepository: Pick<
			UserRepository,
			"findByEmail" | "update"
		>,
		private readonly emailService: EmailService,
		private readonly templateService: TemplateService,
	) {}

	async execute(params: ForgotPassword.Params): Promise<ForgotPassword.Result> {
		const { email } = params;

		const userModel = await this.userRepository.findByEmail(email);
		if (!userModel) {
			return {
				message:
					"If an account with this email exists, a password reset link has been sent.",
				expiresIn: "1 hour",
			};
		}

		const user = User.Entity.fromModel(userModel);

		if (!user.isActive()) {
			return {
				message:
					"If an account with this email exists, a password reset link has been sent.",
				expiresIn: "1 hour",
			};
		}
		const resetToken = User.Entity.generatePasswordResetToken();

		user.setPasswordResetToken(resetToken, 60);

		await this.userRepository.update(user.toJSON());

		await this.sendPasswordResetEmail({
			email: user.email,
			name: user.name,
			username: user.username,
			resetToken,
		});

		return {
			message:
				"If an account with this email exists, a password reset link has been sent.",
			expiresIn: "1 hour",
		};
	}

	private async sendPasswordResetEmail(params: {
		email: string;
		name: string;
		username: string;
		resetToken: string;
	}): Promise<void> {
		const { email, name, resetToken } = params;

		const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

		const emailTemplate = await this.templateService.compilePasswordReset({
			name,
			email,
			resetUrl,
		});

		await this.emailService.sendEmail({
			to: { email, name },
			template: emailTemplate,
			options: {
				from: "noreply@yourapp.com",
				priority: "high",
			},
		});
	}
}
