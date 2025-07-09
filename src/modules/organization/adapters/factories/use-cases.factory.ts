import { postmarkEmailService } from "@/src/modules/shared/adapters/factories/service.factory";
import type { EmailService } from "@/src/modules/shared/ports/outbound/email-service";
import { userMongooseRepository } from "@/src/modules/user/adapters/factories/repository.factory";
import type { UserRepository } from "@/src/modules/user/core/ports/outbound/user-repository";
import type { OrganizationTemplateService } from "../../core/app/services/template-service";
import { CreateOrganizationUseCase } from "../../core/app/usecases/create-organization/create-organization.use-case";
import { GetOrganizationMembersUseCase } from "../../core/app/usecases/get-organization-members/get-organization-members.use-case";
import { InviteMemberUseCase } from "../../core/app/usecases/invite-member/invite-member.use-case";
import { LoadMyOrganizationsUseCase } from "../../core/app/usecases/load-my-organizations/load-my-organizations.use-case";
import type { OrganizationInvitationRepository } from "../../core/ports/outbound/organization-invitation-repository";
import type { OrganizationMemberRepository } from "../../core/ports/outbound/organization-member-repository";
import type { OrganizationRepository } from "../../core/ports/outbound/organization-repository";
import {
	organizationInvitationMongooseRepository,
	organizationMemberMongooseRepository,
	organizationMongooseRepository,
} from "./repository.factory";
import { organizationTemplateService } from "./service.factory";
import { AcceptInvitationUseCase } from "../../core/app/usecases/accept-invitation/accept-invitation.use-case";

export class OrganizationUseCasesFactory {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly organizationMemberRepository: OrganizationMemberRepository,
		private readonly organizationInvitationRepository: OrganizationInvitationRepository,
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
		private readonly templateService: OrganizationTemplateService,
	) {}

	createOrganization() {
		return new CreateOrganizationUseCase(
			this.organizationRepository,
			this.organizationMemberRepository,
			this.userRepository,
		);
	}

	getOrganizationMembers() {
		return new GetOrganizationMembersUseCase(
			this.organizationMemberRepository,
			this.organizationInvitationRepository,
			this.userRepository,
		);
	}

	inviteMember() {
		return new InviteMemberUseCase(
			this.userRepository,
			this.organizationInvitationRepository,
			this.emailService,
			this.templateService,
		);
	}

	acceptInvitation() {
		return new AcceptInvitationUseCase(
			this.organizationInvitationRepository,
		);
	}

	loadMyOrganizations() {
		return new LoadMyOrganizationsUseCase(
			this.organizationMemberRepository,
			this.organizationRepository,
		);
	}
}

export const organizationUseCasesFactory = new OrganizationUseCasesFactory(
	organizationMongooseRepository,
	organizationMemberMongooseRepository,
	organizationInvitationMongooseRepository,
	userMongooseRepository,
	postmarkEmailService,
	organizationTemplateService,
);
