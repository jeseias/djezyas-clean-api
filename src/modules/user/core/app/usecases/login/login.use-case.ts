import { AppError } from "@/src/modules/shared/errors";
import type { CryptoRepository } from "@/src/modules/shared/ports/outbound/crypto-repository";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import type { Session } from "../../../domain/entities/session";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound/user-repository";
import type { AuthenticateUser } from "../../services/authenticate-user.service";
import type { TemplateService } from "../../services/template-service";

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
		private readonly cryptoRepository: CryptoRepository,
		private readonly authenticateUser: AuthenticateUser,
		private readonly emailService: EmailService,
		private readonly templateService: TemplateService,
	) {}

	async execute(params: Login.Params): Promise<Login.Result> {
		const { email, password, deviceInfo } = params;

		const userModel = await this.userRepository.findByEmail(email);
		if (!userModel) {
			throw new AppError("Invalid email or password", 401);
		}

		const user = User.Entity.fromModel(userModel);

		if (user.isBlocked()) {
			throw new AppError(
				"Your account has been blocked. Please contact support.",
				403,
			);
		}

		if (!user.isActive()) {
			throw new AppError(
				"Your account is inactive. Please contact support.",
				403,
			);
		}

		if (!user.isEmailVerified()) {
			throw new AppError(
				"Please verify your email address before logging in",
				403,
			);
		}

		const isPasswordValid = await this.cryptoRepository.compare(
			password,
			user.password,
		);
		if (!isPasswordValid) {
			throw new AppError("Invalid email or password", 401);
		}

		const authResult = await this.authenticateUser.execute({
			user,
			deviceInfo,
		});

		await this.sendLoginNotification({
			email: user.email,
			name: user.name,
			username: user.username,
			loginAt: new Date(),
			deviceInfo,
		});

		return {
			user: user.toJSON(),
			session: authResult.session.toJSON(),
			tokens: authResult.tokens,
			message: "Login successful",
		};
	}

	private async sendLoginNotification(params: {
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
				from: "noreply@yourapp.com",
				priority: "normal",
			},
		});
	}
}
