import type { EmailService } from "../../ports/outbound/email-service";
import { createPostmarkConfig } from "./postmark-config";
import { PostmarkEmailService } from "./postmark-email-service";

export const createPostmarkEmailService = (): EmailService => {
	const config = createPostmarkConfig();
	return new PostmarkEmailService(config);
};
