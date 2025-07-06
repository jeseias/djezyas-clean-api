import { withUser } from "@/src/main/elysia/plugins/auth-middleware";
import type { ForgotPassword } from "../../../core/app/usecases/forgot-password/forgot-password.use-case";
import type { Login } from "../../../core/app/usecases/login/login.use-case";
import type { IRegisterUser } from "../../../core/app/usecases/register-user/register-user.use-case";
import type { ResendVerification } from "../../../core/app/usecases/resend-verification/resend-verification.use-case";
import type { ResetPassword } from "../../../core/app/usecases/reset-password/reset-password.use-case";
import type { VerifyEmail } from "../../../core/app/usecases/verify-email/verify-email.use-case";
import {
	makeForgotPasswordUseCase,
	makeLoadMeUseCase,
	makeLoginUseCase,
	makeLogoutUseCase,
	makeRegisterUseCase,
	makeResendVerificationEmailUseCase,
	makeResetPasswordUseCase,
	makeVerifyEmailUseCase,
} from "../../factories/use-cases.factory";

export const userResolvers = {
	Query: {
		me: withUser(async (_args, { userId }) => {
			const loadMeUseCase = makeLoadMeUseCase();
			return await loadMeUseCase.execute({ userId });
		}),
	},

	Mutation: {
		registerUser: async (
			_: unknown,
			{ input }: { input: IRegisterUser.Params },
		) => {
			const registerUseCase = makeRegisterUseCase();
			const result = await registerUseCase.execute(input);
			return result;
		},

		login: async (_: unknown, { input }: { input: Login.Params }) => {
			const loginUseCase = makeLoginUseCase();
			return await loginUseCase.execute(input);
		},

		verifyEmail: async (
			_: unknown,
			{ input }: { input: VerifyEmail.Params },
		) => {
			const verifyEmailUseCase = makeVerifyEmailUseCase();
			return await verifyEmailUseCase.execute(input);
		},

		forgotPassword: async (
			_: unknown,
			{ input }: { input: ForgotPassword.Params },
		) => {
			const forgotPasswordUseCase = makeForgotPasswordUseCase();
			return await forgotPasswordUseCase.execute(input);
		},

		resetPassword: async (
			_: unknown,
			{ input }: { input: ResetPassword.Params },
		) => {
			const resetPasswordUseCase = makeResetPasswordUseCase();
			return await resetPasswordUseCase.execute(input);
		},

		resendVerification: async (
			_: unknown,
			{ input }: { input: ResendVerification.Params },
		) => {
			const resendVerificationUseCase = makeResendVerificationEmailUseCase();
			return await resendVerificationUseCase.execute(input);
		},

		logout: withUser(async ({ input }) => {
			const logoutUseCase = makeLogoutUseCase();
			return await logoutUseCase.execute(input);
		}),
	},
};
