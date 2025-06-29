import { ServerClient } from "postmark";
import type {
	EmailOptions,
	EmailRecipient,
	EmailService,
	EmailTemplate,
} from "../../ports/outbound/email-service";
import type { PostmarkConfig } from "./postmark-config";

export class PostmarkEmailService implements EmailService {
	private client: ServerClient;
	private config: PostmarkConfig;

	constructor(config: PostmarkConfig) {
		this.client = new ServerClient(config.apiToken);
		this.config = config;
	}

	async sendEmail(params: {
		to: EmailRecipient | EmailRecipient[];
		template: EmailTemplate;
		options?: EmailOptions;
	}): Promise<{ messageId: string; status: "sent" | "queued" | "failed" }> {
		try {
			const recipients = Array.isArray(params.to) ? params.to : [params.to];

			const emailData = {
				From: params.options?.from || this.config.defaultFromEmail,
				To: recipients
					.map((recipient) =>
						recipient.name
							? `${recipient.name} <${recipient.email}>`
							: recipient.email,
					)
					.join(", "),
				Subject: params.template.subject,
				HtmlBody: params.template.html,
				TextBody: params.template.text,
				ReplyTo: params.options?.replyTo || this.config.defaultReplyTo,
				Priority: this.mapPriority(params.options?.priority),
			};

			const response = await this.client.sendEmail(emailData);

			return {
				messageId: response.MessageID,
				status: this.mapPostmarkStatus(
					response.SubmittedAt ? "sent" : "queued",
				),
			};
		} catch (error) {
			console.error("Postmark email sending failed:", error);

			return {
				messageId: "",
				status: "failed",
			};
		}
	}

	private mapPriority(priority?: "low" | "normal" | "high"): string {
		switch (priority) {
			case "high":
				return "High";
			case "low":
				return "Low";
			default:
				return "Normal";
		}
	}

	private mapPostmarkStatus(status: string): "sent" | "queued" | "failed" {
		switch (status) {
			case "sent":
				return "sent";
			case "queued":
				return "queued";
			default:
				return "failed";
		}
	}
}
