import { postmarkEmailService } from "@/src/modules/shared/adapters/factories/service.factory";
import { userMongooseRepository } from "@/src/modules/user/adapters/factories/repository.factory";
import { CreateOrganizationUseCase } from "../../core/app/usecases/create-organization/create-organization.use-case";
import { GetOrganizationMembersUseCase } from "../../core/app/usecases/get-organization-members/get-organization-members.use-case";
import { InviteMemberUseCase } from "../../core/app/usecases/invite-member/invite-member.use-case";
import {
	organizationInvitationMongooseRepository,
	organizationMemberMongooseRepository,
	organizationMongooseRepository,
} from "./repository.factory";
import { organizationTemplateService } from "./service.factory";

export const makeCreateOrganizationUseCase = () =>
	new CreateOrganizationUseCase(
		organizationMongooseRepository,
		organizationMemberMongooseRepository,
		userMongooseRepository,
	);

export const makeGetOrganizationMembersUseCase = () =>
	new GetOrganizationMembersUseCase(
		organizationMemberMongooseRepository,
		organizationInvitationMongooseRepository,
		userMongooseRepository,
	);

export const makeInviteMemberUseCase = () =>
	new InviteMemberUseCase(
		userMongooseRepository,
		organizationInvitationMongooseRepository,
		postmarkEmailService,
		organizationTemplateService,
	);
