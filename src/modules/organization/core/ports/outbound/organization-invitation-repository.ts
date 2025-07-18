import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { OrganizationInvitation } from "../../domain/entities/organization-invitation";

export type OrganizationInvitationRepository = Pick<
	Repository<OrganizationInvitation.Model>,
	"create" | "findById" | "update" | "delete"
> & {
	findByToken(token: string): Promise<OrganizationInvitation.Model | null>;
	findByEmailAndOrgId(
		email: string,
		organizationId: string,
	): Promise<OrganizationInvitation.Model | null>;
	findByOrganizationId(
		organizationId: string,
	): Promise<OrganizationInvitation.Model[]>;
	findByEmail(
		email: string,
	): Promise<OrganizationInvitation.ModelWithOrganization[]>;
	// Add more methods as needed
};
