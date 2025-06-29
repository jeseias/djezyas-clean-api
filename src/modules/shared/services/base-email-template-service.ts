import { readFileSync } from "node:fs";
import { join } from "node:path";
import pug from "pug";

export type TemplateVariables = Record<string, unknown>;

export type EmailTemplateData = {
	subject: string;
	html: string;
	text: string;
};

export abstract class BaseEmailTemplateService {
	protected constructor(private readonly baseTemplatesPath?: string) {}

	protected getTemplatesPath(modulePath: string): string {
		if (this.baseTemplatesPath) {
			return join(this.baseTemplatesPath, modulePath);
		}
		return join(
			process.cwd(),
			"src/modules",
			modulePath,
			"core/app/templates/emails",
		);
	}

	protected async compilePugTemplate(
		modulePath: string,
		templateName: string,
		variables: TemplateVariables,
	): Promise<string> {
		try {
			const templatesPath = this.getTemplatesPath(modulePath);
			const templatePath = join(templatesPath, templateName);
			const templateContent = readFileSync(templatePath, "utf-8");

			// Compile Pug template
			const compiledTemplate = pug.compile(templateContent, {
				filename: templatePath,
				pretty: true,
			});

			return compiledTemplate(variables);
		} catch (error) {
			throw new Error(
				`Failed to compile Pug template ${templateName} from module ${modulePath}: ${error}`,
			);
		}
	}

	protected async compileEmailTemplate(
		modulePath: string,
		templateName: string,
		variables: TemplateVariables,
		subject: string,
	): Promise<EmailTemplateData> {
		const html = await this.compilePugTemplate(
			modulePath,
			templateName,
			variables,
		);

		// Convert HTML to plain text using Pug's built-in functionality
		const text = this.htmlToText(html);

		return {
			subject,
			html,
			text,
		};
	}

	private htmlToText(html: string): string {
		// Simple HTML to text conversion
		// Remove HTML tags and decode common entities
		return html
			.replace(/<[^>]*>/g, "") // Remove HTML tags
			.replace(/&nbsp;/g, " ") // Replace non-breaking spaces
			.replace(/&amp;/g, "&") // Replace ampersands
			.replace(/&lt;/g, "<") // Replace less than
			.replace(/&gt;/g, ">") // Replace greater than
			.replace(/&quot;/g, '"') // Replace quotes
			.replace(/&#39;/g, "'") // Replace apostrophes
			.replace(/\s+/g, " ") // Replace multiple spaces with single space
			.trim();
	}

	// Generic method for compiling any Pug template from any module
	async compileTemplate(
		modulePath: string,
		templateName: string,
		variables: TemplateVariables,
	): Promise<string> {
		return this.compilePugTemplate(modulePath, templateName, variables);
	}

	protected getDefaultVariables(
		overrides: TemplateVariables = {},
	): TemplateVariables {
		return {
			appName: "Our Platform",
			currentYear: new Date().getFullYear(),
			...overrides,
		};
	}
}
