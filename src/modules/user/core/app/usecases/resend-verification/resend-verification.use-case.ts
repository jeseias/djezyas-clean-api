import { AppError } from "@/src/modules/shared/errors";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound/user-repository";
import type { TemplateService } from "../../services/template-service";

export namespace ResendVerification {
	export type Params = {
		email: string;
	};

	export type Result = {
		message: string;
		expiresIn: string;
	};
}

export class ResendVerificationUseCase {
	constructor(
		private readonly userRepository: Pick<
			UserRepository,
			"findByEmail" | "update"
		>,
		private readonly emailService: EmailService,
		private readonly templateService: TemplateService,
	) {}

	async execute(
		params: ResendVerification.Params,
	): Promise<ResendVerification.Result> {
		const { email } = params;

		const userModel = await this.userRepository.findByEmail(email);
		if (!userModel) {
			throw new AppError("User not found", 404);
		}

		const user = User.Entity.fromModel(userModel);

		if (user.isEmailVerified()) {
			throw new AppError("Email is already verified", 400);
		}

		const verificationCode = User.Entity.generateVerificationCode();

		user.setVerificationCode(verificationCode, 10);

		await this.userRepository.update(user.toJSON());

		await this.sendVerificationEmail({
			email: user.email,
			name: user.name,
			username: user.username,
			verificationCode,
		});

		return {
			message: "Verification code has been resent to your email",
			expiresIn: "10 minutes",
		};
	}

	private async sendVerificationEmail(params: {
		email: string;
		name: string;
		username: string;
		verificationCode: string;
	}): Promise<void> {
		const { email, name, verificationCode } = params;

		const emailTemplate = await this.templateService.compileEmailVerification({
			name,
			email,
			verificationCode,
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
