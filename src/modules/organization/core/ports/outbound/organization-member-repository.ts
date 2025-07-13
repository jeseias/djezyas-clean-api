import type { Repository } from "@/src/modules/shared/ports/outbound/repository";
import type { OrganizationMember } from "../../domain/entities/organization-member";

export type OrganizationMemberRepository = Pick<
	Repository<OrganizationMember.Model>,
	"create" | "findById" | "update" | "delete"
> & {
	findByUserId(params: {
		userId: string;
		organizationId: string;
	}): Promise<OrganizationMember.Model | null>;
	findAllByUserId(userId: string): Promise<OrganizationMember.Model[]>;
	findByOrganizationId(
		organizationId: string,
	): Promise<OrganizationMember.Model[]>;
};
