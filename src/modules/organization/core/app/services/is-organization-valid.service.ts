import { AppError, ErrorCode } from "@/src/modules/shared/errors";
import { Organization } from "../../domain/entities";
import type { OrganizationRepository } from "../../ports/outbound/organization-repository";

export class IsOrganizationValidService {
	constructor(
		private readonly organizationRepository: Pick<
			OrganizationRepository,
			"findById"
		>,
	) {}

	async execute(organizationId: string): Promise<Organization.Entity> {
		const orgModel = await this.organizationRepository.findById(organizationId);
		if (!orgModel) {
			throw new AppError(
				"Organization not found",
				404,
				ErrorCode.ENTITY_NOT_FOUND,
			);
		}

		const organization = Organization.Entity.fromModel(orgModel);
		if (organization.status !== Organization.Status.ACTIVE) {
			throw new AppError(
				"Organization must be active",
				400,
				ErrorCode.ORGANIZATION_NOT_ACTIVE,
			);
		}

		return organization;
	}
}
