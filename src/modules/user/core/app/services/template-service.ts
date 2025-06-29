import {
	BaseEmailTemplateService,
	type EmailTemplateData,
} from "@/src/modules/shared/services/base-email-template-service";

export class UserTemplateService extends BaseEmailTemplateService {
	async compileEmailVerification(variables: {
		name: string;
		email: string;
		verificationCode: string;
		appName?: string;
		expiresIn?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = this.getDefaultVariables({
			appName: "Our Platform",
			expiresIn: "10 minutes",
			...variables,
		});

		return this.compileEmailTemplate(
			"user",
			"email-verification.pug",
			defaultVariables,
			`Verify your email address - ${defaultVariables.appName}`,
		);
	}

	async compilePasswordReset(variables: {
		name: string;
		email: string;
		resetUrl: string;
		appName?: string;
		expiresIn?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = this.getDefaultVariables({
			appName: "Our Platform",
			expiresIn: "1 hour",
			...variables,
		});

		return this.compileEmailTemplate(
			"user",
			"password-reset.pug",
			defaultVariables,
			`Reset your password - ${defaultVariables.appName}`,
		);
	}

	async compileLoginNotification(variables: {
		name: string;
		email: string;
		username: string;
		loginAt: Date;
		deviceInfo: {
			userAgent: string;
			ipAddress: string;
			deviceType?: string;
			browser?: string;
			os?: string;
		};
		appName?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = this.getDefaultVariables({
			appName: "Our Platform",
			...variables,
		});

		return this.compileEmailTemplate(
			"user",
			"login-notification.pug",
			defaultVariables,
			`New login detected - ${defaultVariables.appName}`,
		);
	}
}
