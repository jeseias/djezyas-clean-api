import { _env } from "@/src/main/config/_env";

export interface PostmarkConfig {
	apiToken: string;
	defaultFromEmail: string;
	defaultReplyTo?: string;
}

export const createPostmarkConfig = (): PostmarkConfig => {
	const apiToken = _env.POSTMARK_API_KEY;

	if (!apiToken) {
		throw new Error("POSTMARK_API_TOKEN environment variable is required");
	}

	return {
		apiToken,
		defaultFromEmail: _env.POSTMARK_FROM_EMAIL,
		defaultReplyTo: _env.POSTMARK_REPLY_TO_EMAIL,
	};
};
