export type EmailTemplate = {
	subject: string;
	html: string;
	text: string;
};

export type EmailRecipient = {
	email: string;
	name?: string;
};

export type EmailOptions = {
	from?: string;
	replyTo?: string;
	priority?: "low" | "normal" | "high";
};

export type EmailService = {
	sendEmail: (params: {
		to: EmailRecipient | EmailRecipient[];
		template: EmailTemplate;
		options?: EmailOptions;
	}) => Promise<{ messageId: string; status: "sent" | "queued" | "failed" }>;
};
