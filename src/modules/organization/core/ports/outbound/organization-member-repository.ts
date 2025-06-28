import type { OrganizationMember } from "../../domain/entities/organization-member";

export type OrganizationMemberRepository = {
	create(member: OrganizationMember.Model): Promise<void>;
	findByUserId(userId: string): Promise<OrganizationMember.Model[]>;
	findByOrganizationId(
		organizationId: string,
	): Promise<OrganizationMember.Model[]>;
	// Add more methods as needed
};
