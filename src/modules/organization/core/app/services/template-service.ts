import {
	BaseEmailTemplateService,
	type EmailTemplateData,
} from "@/src/modules/shared/services/base-email-template-service";

export class OrganizationTemplateService extends BaseEmailTemplateService {
	constructor() {
		super();
	}

	async compileOrgInvite(variables: {
		name: string;
		email: string;
		role: string;
		inviteLink: string;
		appName?: string;
	}): Promise<EmailTemplateData> {
		const defaultVariables = this.getDefaultVariables({
			appName: "Our Platform",
			...variables,
		});

		return this.compileEmailTemplate(
			"organization",
			"invite-member.pug",
			defaultVariables,
			`You're invited to join an organization - ${defaultVariables.appName}`,
		);
	}
}
