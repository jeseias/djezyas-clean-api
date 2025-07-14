import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import type { OrganizationMember } from "../../domain/entities";
import type { OrganizationMemberRepository } from "../../ports/outbound/organization-member-repository";

export class IsOrganizationMemberService {
	constructor(
		private readonly organizationMemberRepository: OrganizationMemberRepository,
	) {}

	async execute(
		userId: string,
		organizationId: string,
	): Promise<OrganizationMember.Model> {
		const organizationMember =
			await this.organizationMemberRepository.findByUserId({
				userId,
				organizationId,
			});

		if (!organizationMember) {
			throw new AppError(
				"User is not a member of the organization",
				403,
				ErrorCode.FORBIDDEN,
			);
		}

		return organizationMember;
	}
}
