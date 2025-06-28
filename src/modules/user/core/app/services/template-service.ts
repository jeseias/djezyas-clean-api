import { readFileSync } from "node:fs";
import { join } from "node:path";
import pug from "pug";

export type TemplateVariables = Record<string, unknown>;

export type EmailTemplateData = {
	subject: string;
	html: string;
	text: string;
};

export class TemplateService {
	private readonly templatesPath: string;

	constructor() {
		this.templatesPath = join(
			process.cwd(),
			"src/modules/user/core/app/templates/emails",
		);
	}

	async compileEmailVerification(variables: {
		name: string;
		email: string;
		verificationCode: string;
		appName?: string;
		expiresIn?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = {
			appName: "Our Platform",
			expiresIn: "10 minutes",
			currentYear: new Date().getFullYear(),
			...variables,
		};

		const html = await this.compilePugTemplate(
			"email-verification.pug",
			defaultVariables,
		);
		const text = await this.compilePugTemplate(
			"email-verification-text.pug",
			defaultVariables,
		);

		return {
			subject: `Verify your email address - ${defaultVariables.appName}`,
			html,
			text,
		};
	}

	async compilePasswordReset(variables: {
		name: string;
		email: string;
		resetUrl: string;
		appName?: string;
		expiresIn?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = {
			appName: "Our Platform",
			expiresIn: "1 hour",
			currentYear: new Date().getFullYear(),
			...variables,
		};

		const html = await this.compilePugTemplate(
			"password-reset.pug",
			defaultVariables,
		);
		const text = await this.compilePugTemplate(
			"password-reset-text.pug",
			defaultVariables,
		);

		return {
			subject: `Reset your password - ${defaultVariables.appName}`,
			html,
			text,
		};
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
		const defaultVariables = {
			appName: "Our Platform",
			currentYear: new Date().getFullYear(),
			...variables,
		};

		const html = await this.compilePugTemplate(
			"login-notification.pug",
			defaultVariables,
		);
		const text = await this.compilePugTemplate(
			"login-notification-text.pug",
			defaultVariables,
		);

		return {
			subject: `New login detected - ${defaultVariables.appName}`,
			html,
			text,
		};
	}

	private async compilePugTemplate(
		templateName: string,
		variables: TemplateVariables,
	): Promise<string> {
		try {
			const templatePath = join(this.templatesPath, templateName);
			const templateContent = readFileSync(templatePath, "utf-8");

			// Compile Pug template
			const compiledTemplate = pug.compile(templateContent, {
				filename: templatePath,
				pretty: true,
			});

			return compiledTemplate(variables);
		} catch (error) {
			throw new Error(
				`Failed to compile Pug template ${templateName}: ${error}`,
			);
		}
	}

	// Generic method for compiling any Pug template
	async compileTemplate(
		templateName: string,
		variables: TemplateVariables,
	): Promise<string> {
		return this.compilePugTemplate(templateName, variables);
	}
}
