import { AppError } from "@/src/modules/shared/errors";
import type { CryptoRepository } from "@/src/modules/shared/ports/outbound/crypto-repository";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import { password } from "@/src/modules/shared/value-objects/password";
import { User } from "../../../domain/entities/user";
import type { UserRepository } from "../../../ports/outbound";
import type { TemplateService } from "../../services/template-service";

export namespace IRegisterUser {
	export type Params = {
		email: string;
		username: string;
		phone: string;
		name: string;
		password: string;
		avatar?: string;
	};
	export type Result = User.Model;
}

export class RegisterUserUseCase {
	constructor(
		private readonly userRepository: Pick<
			UserRepository,
			"create" | "findByEmail" | "findByUsername" | "findByPhone" | "update"
		>,
		private readonly cryptoRepository: CryptoRepository,
		private readonly emailService: EmailService,
		private readonly templateService: TemplateService,
	) {}

	async execute(props: IRegisterUser.Params): Promise<IRegisterUser.Result> {
		const { email, username, phone, password: passwordValue, name } = props;

		password(passwordValue);

		const existingUserByEmail = await this.userRepository.findByEmail(email);
		if (existingUserByEmail) {
			throw new AppError("User with this email already exists", 409);
		}

		const existingUserByUsername =
			await this.userRepository.findByUsername(username);
		if (existingUserByUsername) {
			throw new AppError("User with this username already exists", 409);
		}

		const existingUserByPhone = await this.userRepository.findByPhone(phone);
		if (existingUserByPhone) {
			throw new AppError("User with this phone number already exists", 409);
		}

		const hashedPassword = await this.cryptoRepository.hash(passwordValue);

		const user = User.Entity.create({
			email,
			username,
			phone,
			name,
			password: hashedPassword,
		});

		const verificationCode = User.Entity.generateVerificationCode();

		user.setVerificationCode(verificationCode, 10);

		const createdUser = await this.userRepository.create(user);

		await this.sendVerificationEmail({
			email: user.email,
			name: user.name,
			username: user.username,
			verificationCode,
		});

		return createdUser;
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
