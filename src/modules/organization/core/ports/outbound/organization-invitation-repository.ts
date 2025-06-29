import type { OrganizationInvitation } from "../../domain/entities/organization-invitation";

export type OrganizationInvitationRepository = {
	create(invitation: OrganizationInvitation.Model): Promise<void>;
	findByToken(token: string): Promise<OrganizationInvitation.Model | null>;
	findByEmailAndOrgId(
		email: string,
		organizationId: string,
	): Promise<OrganizationInvitation.Model | null>;
	// Add more methods as needed
};
