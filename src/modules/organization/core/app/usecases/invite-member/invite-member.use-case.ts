import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import { OrganizationInvitation } from "../../../domain/entities/organization-invitation";
import type { OrganizationInvitationRepository } from "../../../ports/outbound/organization-invitation-repository";
import type { OrganizationTemplateService } from "../../services/template-service";

export namespace InviteMember {
	export type Params = {
		organizationId: string;
		email: string;
		role: "admin" | "member";
	};
	export type Result = {
		invitation: OrganizationInvitation.Model;
		isRegistered: boolean;
		inviteLink: string;
		isResent: boolean;
	};
}

export class InviteMemberUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
		private readonly emailService: EmailService,
		private readonly templateService: OrganizationTemplateService,
	) {}

	async execute(params: InviteMember.Params): Promise<InviteMember.Result> {
		const user = await this.userRepository.findByEmail(params.email);
		const isRegistered = !!user;

		const existingInvitation =
			await this.organizationInvitationRepository.findByEmailAndOrgId(
				params.email,
				params.organizationId,
			);

		let invitation: OrganizationInvitation.Entity;
		let isResent = false;

		if (existingInvitation) {
			invitation = OrganizationInvitation.Entity.fromModel(existingInvitation);
			invitation.refresh();
			await this.organizationInvitationRepository.update(invitation.toJSON());
			isResent = true;
		} else {
			invitation = OrganizationInvitation.Entity.create({
				organizationId: params.organizationId,
				email: params.email,
				role: params.role,
			});
			await this.organizationInvitationRepository.create(invitation.toJSON());
		}

		const inviteLink = `https://myapp.com/join-org?token=${invitation.token}`;
		// await this.sendInviteEmail({
		// 	email: params.email,
		// 	role: params.role,
		// 	inviteLink,
		// });

		return {
			invitation: invitation.toJSON(),
			isRegistered,
			inviteLink,
			isResent,
		};
	}

	private async sendInviteEmail(params: {
		email: string;
		role: string;
		inviteLink: string;
	}) {
		const { email, role, inviteLink } = params;

		const template = await this.templateService.compileOrgInvite({
			name: email,
			email,
			role,
			inviteLink,
		});

		await this.emailService.sendEmail({
			to: { email },
			template,
		});
	}
}
