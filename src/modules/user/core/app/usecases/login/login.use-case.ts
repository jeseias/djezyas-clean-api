import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import type { PasswordHasher } from "@/src/modules/shared/ports/outbound/password-hasher";
import type { Session } from "../../../domain/entities/session";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound";
import type { AuthenticateUser } from "../../services/authenticate-user.service";
import type { UserTemplateService } from "../../services/template-service";

export namespace Login {
	export type Params = {
		email: string;
		password: string;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
	};

	export type Result = {
		user: User.Model;
		session: Session.Model;
		tokens: {
			accessToken: string;
			refreshToken: string;
			accessTokenExpiresIn: string;
			refreshTokenExpiresIn: string;
		};
		message: string;
	};
}

export class LoginUseCase {
	constructor(
		private readonly userRepository: Pick<UserRepository, "findByEmail">,
		private readonly passwordHasher: PasswordHasher,
		private readonly authenticateUser: AuthenticateUser,
		private readonly emailService: EmailService,
		private readonly templateService: UserTemplateService,
	) {}

	async execute(params: Login.Params): Promise<Login.Result> {
		const { email, password, deviceInfo } = params;

		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new AppError(
				"Invalid email or password",
				401,
				ErrorCode.INVALID_CREDENTIALS,
			);
		}

		const userEntity = User.Entity.fromModel(user);

		if (!userEntity.isEmailVerified()) {
			throw new AppError(
				"Please verify your email before logging in",
				403,
				ErrorCode.EMAIL_NOT_VERIFIED,
			);
		}

		const isPasswordValid = await this.passwordHasher.compare(
			password,
			userEntity.password,
		);

		if (!isPasswordValid) {
			throw new AppError(
				"Invalid email or password",
				401,
				ErrorCode.INVALID_CREDENTIALS,
			);
		}

		const authenticationResult = await this.authenticateUser.execute({
			user: userEntity,
			deviceInfo,
		});

		// await this.sendLoginNotificationEmail({
		// 	email: userEntity.email,
		// 	name: userEntity.name,
		// 	username: userEntity.username,
		// 	loginAt: new Date(),
		// 	deviceInfo,
		// });

		return {
			user: authenticationResult.user.toJSON(),
			session: authenticationResult.session.toJSON(),
			tokens: authenticationResult.tokens,
			message: "Login successful",
		};
	}

	private async sendLoginNotificationEmail(params: {
		email: string;
		name: string;
		username: string;
		loginAt: Date;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: "mobile" | "desktop" | "tablet";
			browser?: string;
			os?: string;
		};
	}): Promise<void> {
		const { email, name, username, loginAt, deviceInfo } = params;

		const emailTemplate = await this.templateService.compileLoginNotification({
			name,
			email,
			username,
			loginAt,
			deviceInfo,
		});

		await this.emailService.sendEmail({
			to: { email, name },
			template: emailTemplate,
			options: {
				from: "security@yourapp.com",
				priority: "high",
			},
		});
	}
}
