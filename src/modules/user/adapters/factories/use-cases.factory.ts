import {
	passwordHasher,
	postmarkEmailService,
} from "@/src/modules/shared/adapters/factories/service.factory";
import { ForgotPasswordUseCase } from "../../core/app/usecases/forgot-password/forgot-password.use-case";
import { LoginUseCase } from "../../core/app/usecases/login/login.use-case";
import { RegisterUserUseCase } from "../../core/app/usecases/register-user/register-user.use-case";
import { ResendVerificationUseCase } from "../../core/app/usecases/resend-verification/resend-verification.use-case";
import { ResetPasswordUseCase } from "../../core/app/usecases/reset-password/reset-password.use-case";
import { VerifyEmailUseCase } from "../../core/app/usecases/verify-email/verify-email.use-case";
import { userMongooseRepository } from "./repository.factory";
import { authenticateUser, userEmailTemplateService } from "./service.factory";

export const makeRegisterUseCase = () =>
	new RegisterUserUseCase(
		userMongooseRepository,
		passwordHasher,
		postmarkEmailService,
		userEmailTemplateService,
	);

export const makeLoginUseCase = () =>
	new LoginUseCase(
		userMongooseRepository,
		passwordHasher,
		authenticateUser,
		postmarkEmailService,
		userEmailTemplateService,
	);

export const makeForgotPasswordUseCase = () =>
	new ForgotPasswordUseCase(
		userMongooseRepository,
		postmarkEmailService,
		userEmailTemplateService,
	);

export const makeResetPasswordUseCase = () =>
	new ResetPasswordUseCase(userMongooseRepository, passwordHasher);

export const makeVerifyEmailUseCase = () =>
	new VerifyEmailUseCase(userMongooseRepository);

export const makeResendVerificationEmailUseCase = () =>
	new ResendVerificationUseCase(
		userMongooseRepository,
		postmarkEmailService,
		userEmailTemplateService,
	);
